export type ToolStatus = 'idle' | 'selected' | 'processing' | 'completed' | 'error';

export interface AuthUser {
  name: string;
  email: string;
  avatar?: string;
}
