import { useState, useCallback }              from "react";
import { useAdmin }                           from "../../context/AdminContext";
import { uploadImage, deleteImage } from "../../api/imageApi";
import GalleryStrip                           from "./GalleryStrip";
import MasonryGrid                            from "./MasonryGrid";
import Lightbox                               from "./Lightbox";

export default function Gallery() {
  const {
    isAdmin,
    galleryItems,
    setGalleryItemUrl,
    addGalleryItems,
    removeGalleryItem,
  } = useAdmin();

  /* ── lightbox ── */
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const openLightbox  = useCallback((i) => setLightboxIdx(i), []);
  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const prevItem      = useCallback(() =>
    setLightboxIdx(i => (i - 1 + galleryItems.length) % galleryItems.length),
  [galleryItems.length]);
  const nextItem      = useCallback(() =>
    setLightboxIdx(i => (i + 1) % galleryItems.length),
  [galleryItems.length]);

  /* ── inline remove confirm ── */
  const [pendingRemove, setPendingRemove] = useState(null);
  const [uploading,     setUploading]     = useState(false);
  const [apiError,      setApiError]      = useState("");

  /* ── admin: add new photos ── */
  const handleAddItems = useCallback(async (files) => {
    setUploading(true);
    setApiError("");
    try {
      const newItems = await Promise.all(
        files.map(async (file, i) => {
          const id  = `extra-${Date.now()}-${i}`;
          const { url, publicId } = await uploadImage(file, "gallery", id);
          return { id, label: file.name.replace(/\.[^.]+$/, ""), emoji: "📷",
                   color: "#1a1612", url, publicId, isDefault: false };
        })
      );
      addGalleryItems(newItems);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setUploading(false);
    }
  }, [addGalleryItems]);

  /* ── admin: change existing image ── */
  const handleChangeImage = useCallback(async (idx, file) => {
    const item = galleryItems[idx];
    setUploading(true);
    setApiError("");
    try {
      if (item.publicId) await deleteImage(item.publicId).catch(()=>{});
      const { url, publicId } = await uploadImage(file, "gallery", item.id);
      setGalleryItemUrl(item.id, url, publicId);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setUploading(false);
    }
  }, [galleryItems, setGalleryItemUrl]);

  /* ── admin: remove ── */
  const handleRemoveRequest = useCallback((idx) => {
    const item = galleryItems[idx];
    setPendingRemove({ id: item.id, label: item.label ?? "this photo", url: item.url, publicId: item.publicId });
  }, [galleryItems]);

  const confirmRemove = useCallback(async () => {
    if (!pendingRemove) return;
    setApiError("");
    try {
      if (pendingRemove.publicId) await deleteImage(pendingRemove.publicId).catch(()=>{});
    } catch (err) {
      // log but don't block — still remove from list
      console.warn("Delete from disk failed:", err.message);
    }
    removeGalleryItem(pendingRemove.id);
    setPendingRemove(null);
    if (lightboxIdx !== null) closeLightbox();
  }, [pendingRemove, removeGalleryItem, lightboxIdx, closeLightbox]);

  const cancelRemove = useCallback(() => setPendingRemove(null), []);

  /* ── normalise: src field for MasonryGrid / GalleryStrip ── */
  const items = galleryItems.map(item => ({ ...item, src: item.url ?? null }));

  return (
    <>
      {/* ── Page Header ── */}
      <div style={pageHeaderStyle}>
        <p style={eyebrowStyle}>✦ Visual Stories ✦</p>
        <h1 style={pageTitleStyle}>
          A Feast for <em style={{ color:"var(--gold)", fontStyle:"italic" }}>the Eyes</em>
        </h1>
        <div style={dividerStyle} />
        <p style={pageSubStyle}>
          Every photo tells the story of a dish crafted with care, a moment shared, a memory made.
        </p>
        {isAdmin && (
          <p style={adminHintStyle}>
            🛡️ Admin — Click <strong>Add Photo</strong> in the grid to upload.
            Hover any tile to remove or replace.
          </p>
        )}
        {uploading && <p style={uploadingStyle}>⏳ Uploading…</p>}
        {apiError  && <p style={errorStyle}>⚠ {apiError}</p>}
      </div>

      {/* ── Horizontal Strip ── */}
      <GalleryStrip items={items} onOpen={openLightbox} />

      {/* ── Masonry Grid ── */}
      <MasonryGrid
        items={items}
        onOpen={openLightbox}
        onAddItems={handleAddItems}
        onRemove={handleRemoveRequest}
        onChangeImage={handleChangeImage}
      />

      {/* ── Inline Remove Confirm ── */}
      {pendingRemove && (
        <div style={backdropStyle} onClick={cancelRemove}>
          <div style={confirmBoxStyle} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:"2rem", marginBottom:"0.8rem" }}>🗑️</div>
            <p style={confirmTitleStyle}>Remove Photo?</p>
            <p style={confirmSubStyle}>
              "<em>{pendingRemove.label}</em>" will be permanently deleted from the server.
            </p>
            <div style={confirmBtnsStyle}>
              <button style={cancelBtnStyle}  onClick={cancelRemove}>Cancel</button>
              <button style={deleteBtnStyle}  onClick={confirmRemove}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightboxIdx !== null && (
        <Lightbox
          item={items[lightboxIdx]}
          index={lightboxIdx}
          total={items.length}
          onClose={closeLightbox}
          onPrev={prevItem}
          onNext={nextItem}
        />
      )}
    </>
  );
}

/* ── styles ── */
const pageHeaderStyle = {
  padding:"5rem 5% 3.5rem", textAlign:"center",
  background:"radial-gradient(ellipse at center top, rgba(168,76,47,0.08) 0%, transparent 60%)",
  borderBottom:"1px solid var(--border)",
};
const eyebrowStyle    = { fontSize:"0.72rem", letterSpacing:"0.32em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"1rem" };
const pageTitleStyle  = { fontFamily:"'Playfair Display', serif", fontSize:"clamp(2.5rem, 6vw, 4rem)", fontWeight:900, color:"var(--cream)", lineHeight:1.1, marginBottom:"1.5rem" };
const dividerStyle    = { width:"60px", height:"1px", background:"linear-gradient(90deg, transparent, var(--gold), transparent)", margin:"0 auto 1.5rem" };
const pageSubStyle    = { fontSize:"1rem", color:"var(--muted)", lineHeight:1.8, maxWidth:"520px", margin:"0 auto" };
const adminHintStyle  = { marginTop:"1.5rem", display:"inline-block", padding:"0.5rem 1.2rem", background:"rgba(201,144,58,0.08)", border:"1px solid var(--border)", borderRadius:"20px", fontSize:"0.78rem", color:"var(--muted)" };
const uploadingStyle  = { marginTop:"0.8rem", fontSize:"0.8rem", color:"var(--gold)" };
const errorStyle      = { marginTop:"0.8rem", fontSize:"0.8rem", color:"#e07a5f" };

const backdropStyle   = { position:"fixed", inset:0, zIndex:2000, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" };
const confirmBoxStyle = { background:"#1a1510", border:"1px solid rgba(168,76,47,0.4)", borderRadius:"14px", padding:"2.5rem 2rem", maxWidth:"380px", width:"100%", textAlign:"center", boxShadow:"0 24px 60px rgba(0,0,0,0.5)" };
const confirmTitleStyle = { fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", color:"var(--cream)", marginBottom:"0.6rem" };
const confirmSubStyle   = { fontSize:"0.85rem", color:"var(--muted)", lineHeight:1.7, marginBottom:"2rem" };
const confirmBtnsStyle  = { display:"flex", gap:"1rem", justifyContent:"center" };
const cancelBtnStyle    = { padding:"0.65rem 1.6rem", background:"none", border:"1px solid var(--border)", borderRadius:"6px", color:"var(--muted)", fontSize:"0.8rem", fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" };
const deleteBtnStyle    = { padding:"0.65rem 1.6rem", background:"rgba(168,76,47,0.85)", border:"1px solid rgba(168,76,47,0.5)", borderRadius:"6px", color:"white", fontSize:"0.8rem", fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" };
