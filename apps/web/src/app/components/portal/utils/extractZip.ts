import JSZip from 'jszip';

const EXT_TO_MIME: Record<string, string> = {
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
  png:  'image/png',
  gif:  'image/gif',
  webp: 'image/webp',
  svg:  'image/svg+xml',
  avif: 'image/avif',
  heic: 'image/heic',
  tiff: 'image/tiff',
  tif:  'image/tiff',
};

export async function extractZip(zipFile: File): Promise<{ folderName: string; files: File[] }> {
  const folderName = zipFile.name.replace(/\.zip$/i, '') || 'Uploaded Folder';
  const zip = await JSZip.loadAsync(zipFile);
  const files: File[] = [];

  for (const [relativePath, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    if (relativePath.startsWith('__MACOSX/') || relativePath.includes('/._')) continue;
    const fileName = relativePath.split('/').pop() ?? relativePath;
    if (fileName.startsWith('.')) continue;

    const ext  = fileName.split('.').pop()?.toLowerCase() ?? '';
    const mime = EXT_TO_MIME[ext] ?? 'application/octet-stream';
    const blob = await entry.async('blob');
    files.push(new File([blob], fileName, { type: mime }));
  }

  return { folderName, files };
}
