import { API_ORIGIN } from '../api-constants';

export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (path == null || path === '') return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = API_ORIGIN.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
