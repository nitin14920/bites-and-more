/**
 * src/api/imageApi.js — Browser → Cloudinary upload + JSONBin shared storage.
 *
 * Vercel env vars:
 *   VITE_CLOUDINARY_CLOUD_NAME     e.g. dl6a772rj
 *   VITE_CLOUDINARY_UPLOAD_PRESET  e.g. bites-and-more  (Unsigned)
 *   VITE_JSONBIN_BIN_ID            e.g. 6601abc...       (your bin ID)
 *   VITE_JSONBIN_API_KEY           e.g. $2a$10$...       (your master key)
 *
 * JSONBin setup (free at jsonbin.io):
 *   1. Sign up → API Keys → copy Master Key
 *   2. Create a Bin with this initial JSON: {}
 *   3. Copy the Bin ID from the URL
 *   Add both to Vercel env vars + .env.local, then redeploy.
 */

const CLOUD    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET   = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const BIN_ID   = import.meta.env.VITE_JSONBIN_BIN_ID;
const BIN_KEY  = import.meta.env.VITE_JSONBIN_API_KEY;
const BIN_URL  = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

/* ── Cloudinary upload ── */
export async function uploadImage(file, category = "gallery", _slot = null) {
  if (!CLOUD || !PRESET) throw new Error(
    `Cloudinary not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in Vercel.`
  );

  const form = new FormData();
  form.append("file",          file);
  form.append("upload_preset", PRESET);
  form.append("folder",        `bites-and-more/${category}`);

  const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: "POST", body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Upload failed (${res.status})`);

  return { url: data.secure_url, publicId: data.public_id };
}

export async function deleteImage(_publicId) {
  // Unsigned delete not supported — old images stay in Cloudinary Media Library
  // (free tier 25 GB). Manually delete from cloudinary.com if needed.
}

/* ── JSONBin shared store ── */
// Reads the entire shared image map: { heroSlides, specialtyImage, featureImages, ... }
export async function loadSharedImages() {
  if (!BIN_ID || !BIN_KEY) return null;
  try {
    const res  = await fetch(BIN_URL + "/latest", {
      headers: { "X-Master-Key": BIN_KEY, "X-Bin-Meta": "false" },
    });
    if (!res.ok) return null;
    return await res.json(); // the stored object
  } catch { return null; }
}

// Saves the entire shared image map back to JSONBin
export async function saveSharedImages(data) {
  if (!BIN_ID || !BIN_KEY) return;
  try {
    await fetch(BIN_URL, {
      method:  "PUT",
      headers: { "Content-Type": "application/json", "X-Master-Key": BIN_KEY },
      body:    JSON.stringify(data),
    });
  } catch { /* non-critical */ }
}
