import JSZip from 'jszip';

const shouldFail = (name: string) => /_fail_/i.test(name);

/** Simulate ZIP generation with a delay proportional to asset count. */
export async function generateZip(folderName: string, assetCount: number): Promise<Blob> {
  const delay = Math.min(1200 + assetCount * 60, 4000);
  await new Promise(r => setTimeout(r, delay));

  if (shouldFail(folderName)) throw new Error('ZIP generation failed');

  const zip = new JSZip();
  const folder = zip.folder(folderName)!;
  folder.file(
    '_README.txt',
    `Folder: ${folderName}\nAssets included: ${assetCount}\nDownloaded from Constellation Portal`,
  );
  return zip.generateAsync({ type: 'blob' });
}

/** Trigger a browser file download from a Blob. */
export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
