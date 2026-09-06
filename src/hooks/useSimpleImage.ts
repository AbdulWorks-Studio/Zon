import { useEffect, useState } from 'react';

export function useSimpleImage() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [result, setResult] = useState('');
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  useEffect(() => () => { if (result) URL.revokeObjectURL(result); }, [result]);
  const choose = (f: File) => {
    if (!f.type.startsWith('image/')) return;
    if (url) URL.revokeObjectURL(url);
    if (result) URL.revokeObjectURL(result);
    setFile(f); setUrl(URL.createObjectURL(f)); setResult('');
  };
  const reset = () => {
    if (url) URL.revokeObjectURL(url);
    if (result) URL.revokeObjectURL(result);
    setFile(null); setUrl(''); setResult('');
  };
  return { file, url, result, setResult, choose, reset };
}
