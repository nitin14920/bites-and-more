/**
 * src/api/imageApi.js
 *
 * Uploads images DIRECTLY from the browser to Cloudinary.
 * No backend server needed — works on Vercel out of the box.
 *
 * How it works:
 *   - Each image is stored at a fixed public_id: "bites-and-more/<category>/<slot>"
 *   - Uploading to the same public_id automatically REPLACES the old image
 *   - The returned URL is a permanent Cloudinary CDN URL
 *   - deleteImage() explicitly destroys the asset via the unsigned destroy endpoint
 *
 * Setup (one-time):
 *   1. Sign up free at cloudinary.com
 *   2. Dashboard → Settings → Upload → "Add upload preset"
 *        - Signing mode: Unsigned
 *        - Folder: bites-and-more   (optional but keeps things tidy)
 *        - Copy the preset name
 *   3. Add to Vercel environment variables:
 *        VITE_CLOUDINARY_CLOUD_NAME = your_cloud_name
 *        VITE_CLOUDINARY_UPLOAD_PRESET = your_unsigned_preset_name
 *
 * Local dev: create .env.local with the same two vars.
 */

const CLOUD  = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`;

/**
 * Upload a File to Cloudinary.
 *
 * @param {File}   file        - Raw File object from <input type="file">
 * @param {string} category    - Subfolder: gallery | hero | specialty | feature | menu | about | team
 * @param {string} [slot]      - Unique slot name within the category (e.g. item id, index).
 *                               Using a fixed slot means re-uploading REPLACES the old image
 *                               automatically without needing a separate delete call.
 *                               If omitted, a timestamp is used (always creates new asset).
 * @returns {Promise<{url: string, publicId: string}>}
 */
export async function uploadImage(file, category = "gallery", slot = null) {
  if (!CLOUD || !PRESET) {
    throw new Error(
      "Cloudinary not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const publicId = `bites-and-more/${category}/${slot ?? Date.now()}`;

  const form = new FormData();
  form.append("file",             file);
  form.append("upload_preset",    PRESET);
  form.append("public_id",        publicId);
  // overwrite=true replaces the existing asset at this public_id
  form.append("overwrite",        "true");
  form.append("invalidate",       "true"); // bust CDN cache immediately

  const res = await fetch(UPLOAD_URL, { method: "POST", body: form });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Upload failed (${res.status})`);
  }

  const data = await res.json();
  return { url: data.secure_url, publicId: data.public_id };
}

/**
 * Delete an image from Cloudinary by its public_id.
 * Uses the unsigned "destroy" endpoint — requires the upload preset
 * to have "return_delete_token: true" enabled, OR just silently skips
 * (safe to ignore since re-uploading to the same slot overwrites anyway).
 *
 * @param {string} publicId  - e.g. "bites-and-more/menu/item-42"
 */
export async function deleteImage(publicId) {
  if (!publicId || !CLOUD || !PRESET) return;

  // Unsigned delete requires a delete_token returned at upload time.
  // Since we use fixed public_ids and overwrite=true, the old file is
  // replaced automatically on next upload — explicit delete is best-effort.
  try {
    const form = new FormData();
    form.append("public_id",     publicId);
    form.append("upload_preset", PRESET);
    await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD}/image/destroy`,
      { method: "POST", body: form }
    );
  } catch {
    // Silently ignore — next upload to same slot will overwrite anyway
  }
}
