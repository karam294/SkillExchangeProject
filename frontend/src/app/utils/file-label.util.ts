/** Human-readable file name from a media URL or path. */
export function fileLabelFromUrl(url: string | null | undefined): string {
  if (!url) return '';
  try {
    const path = url.split('?')[0] ?? url;
    const segment = path.split('/').filter(Boolean).pop() ?? path;
    return decodeURIComponent(segment);
  } catch {
    return url;
  }
}
