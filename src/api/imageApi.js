/**
 * src/api/imageApi.js — Direct browser → Cloudinary upload. No backend needed.
 *
 * Vercel env vars (Settings → Environment Variables):
 *   VITE_CLOUDINARY_CLOUD_NAME     e.g.  dl6a772rj
 *   VITE_CLOUDINARY_UPLOAD_PRESET  e.g.  bites-and-more   (must be Unsigned)
 *
 * For local dev create .env.local with the same two vars.
 */

const CLOUD  = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export async function uploadImage(file, category = "gallery", _slot = null) {
  if (!CLOUD || !PRESET) {
    throw new Error(
      `Cloudinary not configured.\n` +
      `CLOUD="${CLOUD || "MISSING"}" PRESET="${PRESET || "MISSING"}"\n` +
      `Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in Vercel → Settings → Environment Variables, then redeploy.`
    );
  }

  const form = new FormData();
  form.append("file",          file);
  form.append("upload_preset", PRESET);
  form.append("folder",        `bites-and-more/${category}`);
  // No public_id / overwrite — Cloudinary generates a unique ID each time.
  // Old images accumulate in Cloudinary (free tier has 25GB, plenty for a cafe site).
  // deleteImage() does best-effort cleanup by publicId stored at upload time.

  const res  = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,
    { method: "POST", body: form }
  );
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || `Cloudinary upload failed (HTTP ${res.status})`);
  }

  return { url: data.secure_url, publicId: data.public_id };
}

export async function deleteImage(publicId) {
  // Unsigned delete requires a delete_token — not available in this flow.
  // Old images are cleaned up automatically by Cloudinary's free-tier limits
  // or can be manually deleted from the Cloudinary Media Library dashboard.
  void publicId;
}
