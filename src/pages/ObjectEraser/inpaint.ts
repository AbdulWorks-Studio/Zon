// Client-side content-aware fill: multi-scale diffusion + local patch sampling.
// Not a neural inpainting model — honest about capabilities in tool notes.

export type FillQuality = 'fast' | 'precision4k';

export interface FillOptions {
  quality: FillQuality;
  onProgress?: (percent: number) => void;
}

const QUALITY_SETTINGS: Record<FillQuality, { maxSide: number; iterations: number; patchRadius: number }> = {
  fast: { maxSide: 1600, iterations: 80, patchRadius: 4 },
  precision4k: { maxSide: 3840, iterations: 160, patchRadius: 6 },
};

function featherMask(mask: Uint8ClampedArray, width: number, height: number, passes: number) {
  let src = mask;
  for (let p = 0; p < passes; p++) {
    const dst = new Uint8ClampedArray(src.length);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        let sum = src[idx];
        let count = 1;
        if (x > 0) {
          sum += src[idx - 1];
          count++;
        }
        if (x < width - 1) {
          sum += src[idx + 1];
          count++;
        }
        if (y > 0) {
          sum += src[idx - width];
          count++;
        }
        if (y < height - 1) {
          sum += src[idx + width];
          count++;
        }
        dst[idx] = sum / count;
      }
    }
    src = dst;
  }
  return src;
}

/** Sample unmasked neighborhood average with distance-weighted bias. */
function seedFromNeighbors(
  r: Float32Array,
  g: Float32Array,
  b: Float32Array,
  isMasked: Uint8Array,
  width: number,
  height: number,
  idx: number,
) {
  const x = idx % width;
  const y = (idx / width) | 0;
  let sr = 0,
    sg = 0,
    sb = 0,
    wsum = 0;
  const radius = 12;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const ni = ny * width + nx;
      if (isMasked[ni]) continue;
      const dist = Math.hypot(dx, dy) + 0.5;
      const w = 1 / dist;
      sr += r[ni] * w;
      sg += g[ni] * w;
      sb += b[ni] * w;
      wsum += w;
    }
  }
  if (wsum > 0) return [sr / wsum, sg / wsum, sb / wsum] as const;
  return null;
}

/**
 * Patch-match style: for boundary masked pixels, copy from best-matching
 * unmasked patch nearby (reduces flat smudges).
 */
function patchSeed(
  r: Float32Array,
  g: Float32Array,
  b: Float32Array,
  isMasked: Uint8Array,
  width: number,
  height: number,
  maskedIdx: number[],
  patchR: number,
) {
  const searchR = 28;
  for (const idx of maskedIdx) {
    const x = idx % width;
    const y = (idx / width) | 0;
    // Only seed interior-ish; boundary gets neighbor seed later
    let nearUnmasked = false;
    for (let dy = -2; dy <= 2 && !nearUnmasked; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx,
          ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        if (!isMasked[ny * width + nx]) nearUnmasked = true;
      }
    }
    if (!nearUnmasked) continue;

    let bestScore = Infinity;
    let bestR = r[idx],
      bestG = g[idx],
      bestB = b[idx];

    for (let sy = -searchR; sy <= searchR; sy += 2) {
      for (let sx = -searchR; sx <= searchR; sx += 2) {
        const cx = x + sx;
        const cy = y + sy;
        if (cx < patchR || cy < patchR || cx >= width - patchR || cy >= height - patchR) continue;
        // Require center of candidate unmasked
        if (isMasked[cy * width + cx]) continue;

        let score = 0;
        let samples = 0;
        for (let py = -patchR; py <= patchR; py++) {
          for (let px = -patchR; px <= patchR; px++) {
            const sx2 = x + px;
            const sy2 = y + py;
            const cx2 = cx + px;
            const cy2 = cy + py;
            if (sx2 < 0 || sy2 < 0 || sx2 >= width || sy2 >= height) continue;
            if (cx2 < 0 || cy2 < 0 || cx2 >= width || cy2 >= height) continue;
            const si = sy2 * width + sx2;
            const ci = cy2 * width + cx2;
            // Compare only where source is unmasked (known)
            if (isMasked[si]) continue;
            if (isMasked[ci]) {
              score += 40;
              samples++;
              continue;
            }
            const dr = r[si] - r[ci];
            const dg = g[si] - g[ci];
            const db = b[si] - b[ci];
            score += dr * dr + dg * dg + db * db;
            samples++;
          }
        }
        if (samples < 4) continue;
        score /= samples;
        if (score < bestScore) {
          bestScore = score;
          bestR = r[cy * width + cx];
          bestG = g[cy * width + cx];
          bestB = b[cy * width + cx];
        }
      }
    }
    r[idx] = bestR;
    g[idx] = bestG;
    b[idx] = bestB;
  }
}

export async function runContentFill(
  sourceCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  options: FillOptions,
): Promise<HTMLCanvasElement> {
  const settings = QUALITY_SETTINGS[options.quality];
  const scale = Math.min(1, settings.maxSide / Math.max(sourceCanvas.width, sourceCanvas.height));
  const width = Math.max(1, Math.round(sourceCanvas.width * scale));
  const height = Math.max(1, Math.round(sourceCanvas.height * scale));

  const work = document.createElement('canvas');
  work.width = width;
  work.height = height;
  const workCtx = work.getContext('2d', { willReadFrequently: true })!;
  workCtx.drawImage(sourceCanvas, 0, 0, width, height);

  const maskWork = document.createElement('canvas');
  maskWork.width = width;
  maskWork.height = height;
  const maskCtx = maskWork.getContext('2d', { willReadFrequently: true })!;
  maskCtx.drawImage(maskCanvas, 0, 0, width, height);

  const imageData = workCtx.getImageData(0, 0, width, height);
  const maskAlpha = new Uint8ClampedArray(width * height);
  const rawMask = maskCtx.getImageData(0, 0, width, height).data;
  for (let i = 0; i < width * height; i++) maskAlpha[i] = rawMask[i * 4 + 3];
  const feathered = featherMask(maskAlpha, width, height, 4);

  const { data } = imageData;
  const total = width * height;
  const maskedIdx: number[] = [];
  const weight = new Float32Array(total);
  for (let i = 0; i < total; i++) {
    weight[i] = feathered[i] / 255;
    if (weight[i] > 0.02) maskedIdx.push(i);
  }
  if (maskedIdx.length === 0) return sourceCanvas;

  const r = new Float32Array(total);
  const g = new Float32Array(total);
  const b = new Float32Array(total);
  const isMasked = new Uint8Array(total);
  for (const idx of maskedIdx) isMasked[idx] = 1;
  for (let i = 0; i < total; i++) {
    r[i] = data[i * 4];
    g[i] = data[i * 4 + 1];
    b[i] = data[i * 4 + 2];
  }

  // Seed: neighbor average, then patch match for better texture
  options.onProgress?.(8);
  for (const idx of maskedIdx) {
    const seeded = seedFromNeighbors(r, g, b, isMasked, width, height, idx);
    if (seeded) {
      r[idx] = seeded[0];
      g[idx] = seeded[1];
      b[idx] = seeded[2];
    }
  }
  options.onProgress?.(18);
  patchSeed(r, g, b, isMasked, width, height, maskedIdx, settings.patchRadius);
  options.onProgress?.(28);

  // Diffusion (Laplace) with multi-pass SOR-like updates
  const iterations = settings.iterations;
  const chunk = 5;
  let done = 0;
  const omega = 1.35; // successive over-relaxation
  while (done < iterations) {
    const thisChunk = Math.min(chunk, iterations - done);
    for (let pass = 0; pass < thisChunk; pass++) {
      for (const idx of maskedIdx) {
        const x = idx % width;
        const y = (idx / width) | 0;
        let sr = 0,
          sg = 0,
          sb = 0,
          n = 0;
        if (x > 0) {
          sr += r[idx - 1];
          sg += g[idx - 1];
          sb += b[idx - 1];
          n++;
        }
        if (x < width - 1) {
          sr += r[idx + 1];
          sg += g[idx + 1];
          sb += b[idx + 1];
          n++;
        }
        if (y > 0) {
          sr += r[idx - width];
          sg += g[idx - width];
          sb += b[idx - width];
          n++;
        }
        if (y < height - 1) {
          sr += r[idx + width];
          sg += g[idx + width];
          sb += b[idx + width];
          n++;
        }
        if (n > 0) {
          const nr = sr / n;
          const ng = sg / n;
          const nb = sb / n;
          r[idx] = r[idx] + omega * (nr - r[idx]);
          g[idx] = g[idx] + omega * (ng - g[idx]);
          b[idx] = b[idx] + omega * (nb - b[idx]);
        }
      }
    }
    done += thisChunk;
    options.onProgress?.(Math.min(92, 28 + Math.round((done / iterations) * 64)));
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }

  // Blend with original using feathered mask weight
  for (const idx of maskedIdx) {
    const w = weight[idx];
    data[idx * 4] = data[idx * 4] * (1 - w) + r[idx] * w;
    data[idx * 4 + 1] = data[idx * 4 + 1] * (1 - w) + g[idx] * w;
    data[idx * 4 + 2] = data[idx * 4 + 2] * (1 - w) + b[idx] * w;
  }
  workCtx.putImageData(imageData, 0, 0);
  options.onProgress?.(100);

  const out = document.createElement('canvas');
  out.width = sourceCanvas.width;
  out.height = sourceCanvas.height;
  const outCtx = out.getContext('2d')!;
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = 'high';
  outCtx.drawImage(work, 0, 0, out.width, out.height);
  return out;
}
