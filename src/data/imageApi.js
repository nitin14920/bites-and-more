/**
 * src/api/imageApi.js
 *
 * Generic upload / delete for ALL image types across the site.
 * Images are saved to public/uploads/<category>/ on the server.
 *
 * Categories: gallery | hero | specialty | feature | menu | about | team
 */

/**
 * Upload a File → returns the public URL string.
 * e.g. "/uploads/menu/1720000000000-abc123.jpg"
 */
export async function uploadImage(file, category = "gallery") {
  const form = new FormData();
  form.append("image",    file);
  form.append("category", category);

  const res  = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Upload failed (${res.status})`);
  }
  const data = await res.json();
  return data.url; // "/uploads/<category>/<filename>"
}

/**
 * Delete an uploaded image by its URL or bare filename.
 * Safe to call with null / undefined (no-op).
 */
export async function deleteImage(urlOrFilename) {
  if (!urlOrFilename) return;
  const filename = urlOrFilename.split("/").pop();
  if (!filename) return;

  const res = await fetch(`/api/upload/${encodeURIComponent(filename)}`, {
    method: "DELETE",
  });
  // 404 = already gone — treat as success
  if (!res.ok && res.status !== 404) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Delete failed (${res.status})`);
  }
}
