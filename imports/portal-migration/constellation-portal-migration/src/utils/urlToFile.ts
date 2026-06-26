/**
 * Fetches a remote image URL and wraps the response as a File object.
 * Used when opening LifestyleTaggerModal for an existing asset whose File
 * object is no longer in memory.
 */
export async function urlToFile(url: string, filename: string): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || 'image/jpeg' });
}
