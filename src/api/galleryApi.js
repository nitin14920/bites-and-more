/**
 * src/api/galleryApi.js
 *
 * Thin wrappers around the Express image API.
 * Both functions throw on failure so callers can catch and show errors.
 */

/**
 * Upload a File object → returns the public URL string.
 * e.g. "/uploads/gallery/1720000000000-abc123.jpg"
 */
export async function uploadGalleryImage(file) {
  const form = new FormData();
  form.append("image", file);

  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Upload failed (${res.status})`);
  }
  const data = await res.json();
  return data.url; // "/uploads/gallery/<filename>"
}

/**
 * Delete an uploaded image by its URL or filename.
 * Safe to call with null / undefined (no-op).
 */
export async function deleteGalleryImage(urlOrFilename) {
  if (!urlOrFilename) return;

  // Extract just the filename from a full URL like /uploads/gallery/foo.jpg
  const filename = urlOrFilename.split("/").pop();
  if (!filename) return;

  const res = await fetch(`/api/upload/${encodeURIComponent(filename)}`, {
    method: "DELETE",
  });

  // 404 just means it was already gone — treat as success
  if (!res.ok && res.status !== 404) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Delete failed (${res.status})`);
  }
}
