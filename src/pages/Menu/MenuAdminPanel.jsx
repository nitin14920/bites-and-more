import { useState, useRef } from "react";
import { useAdmin }         from "../../context/AdminContext";
import { uploadImage, deleteImage } from "../../api/imageApi";

/* ─── helpers ─── */
const uid = () => `custom-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

export default function MenuAdminPanel({ onClose }) {
  const {
    menuCategories, addMenuCategory, updateMenuCategory, deleteMenuCategory,
    menuItems,      addMenuItem,     updateMenuItem,     deleteMenuItem, updateMenuItemImage,
  } = useAdmin();

  const [tab,          setTab]          = useState("categories"); // "categories" | "items"
  const [activeCat,    setActiveCat]    = useState(menuCategories[0]?.key ?? "");
  const [editingCat,   setEditingCat]   = useState(null);  // category key being edited
  const [editingItem,  setEditingItem]  = useState(null);  // item id being edited
  const [showAddCat,   setShowAddCat]   = useState(false);
  const [showAddItem,  setShowAddItem]  = useState(false);
  const [busy,         setBusy]         = useState(false);
  const [error,        setError]        = useState("");

  /* ─── category form ─── */
  const [catForm, setCatForm] = useState({ key:"", label:"", icon:"🍽️" });

  function openAddCat() {
    setCatForm({ key:"", label:"", icon:"🍽️" });
    setShowAddCat(true); setEditingCat(null);
  }
  function openEditCat(cat) {
    setCatForm({ key: cat.key, label: cat.label, icon: cat.icon });
    setEditingCat(cat.key); setShowAddCat(true);
  }
  function saveCat() {
    if (!catForm.label.trim()) return setError("Category name is required");
    if (editingCat) {
      updateMenuCategory(editingCat, { label: catForm.label.trim(), icon: catForm.icon });
    } else {
      const key = slugify(catForm.label) || uid();
      addMenuCategory({ key, label: catForm.label.trim(), icon: catForm.icon });
      setActiveCat(key);
    }
    setShowAddCat(false); setError("");
  }
  function confirmDeleteCat(key) {
    if (!window.confirm(`Delete category "${menuCategories.find(c=>c.key===key)?.label}"?\nAll items in it will also be deleted.`)) return;
    deleteMenuCategory(key);
    if (activeCat === key) setActiveCat(menuCategories.find(c=>c.key!==key)?.key ?? "");
  }

  /* ─── item form ─── */
  const blankItem = { name:"", desc:"", price:"", emoji:"🍽️", veg:true, badge:"", imageUrl:"" };
  const [itemForm, setItemForm] = useState(blankItem);
  const imgInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState("");

  function openAddItem() {
    setItemForm({ ...blankItem, category: activeCat });
    setPreviewUrl(""); setShowAddItem(true); setEditingItem(null);
  }
  function openEditItem(item) {
    setItemForm({ ...item });
    setPreviewUrl(item.imageUrl || ""); setShowAddItem(true); setEditingItem(item.id);
  }
  async function handleItemImageSelect(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setBusy(true); setError("");
    try {
      const slot = editingItem ? `item-${editingItem}` : `item-new-${Date.now()}`;
      const { url, publicId } = await uploadImage(file, "menu", slot);
      setItemForm(f => ({ ...f, imageUrl: url, imagePublicId: publicId }));
    } catch(err) { setError(err.message); }
    finally { setBusy(false); e.target.value=""; }
  }
  async function saveItem() {
    if (!itemForm.name.trim()) return setError("Item name is required");
    if (!itemForm.price.trim()) return setError("Price is required");
    const tags = [itemForm.category, itemForm.veg ? "veg" : "non-veg"];
    if (editingItem) {
      updateMenuItem(editingItem, { ...itemForm, tags });
    } else {
      addMenuItem({ ...itemForm, id: uid(), tags, name: itemForm.name.trim(), desc: itemForm.desc.trim() });
    }
    setShowAddItem(false); setError(""); setPreviewUrl("");
  }
  async function confirmDeleteItem(item) {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    await deleteMenuItem(item.id);
  }

  const catItems = menuItems.filter(i => i.category === activeCat);

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={panelStyle} onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div style={panelHeaderStyle}>
          <h2 style={panelTitleStyle}>🍽️ Menu Manager</h2>
          <button style={closeBtnStyle} onClick={onClose}>✕</button>
        </div>

        {/* ── Tabs ── */}
        <div style={tabsStyle}>
          {["categories","items"].map(t => (
            <button key={t} style={tabBtnStyle(tab===t)} onClick={() => setTab(t)}>
              {t === "categories" ? "📂 Categories" : "🥘 Items"}
            </button>
          ))}
        </div>

        {error && <p style={errorStyle}>⚠ {error}</p>}

        {/* ══ CATEGORIES TAB ══ */}
        {tab === "categories" && (
          <div style={tabBodyStyle}>
            <div style={sectionHeaderStyle}>
              <span style={sectionTitleStyle}>All Categories</span>
              <button style={addBtnStyle} onClick={openAddCat}>＋ Add Category</button>
            </div>

            {/* Add / Edit Category Form */}
            {showAddCat && (
              <div style={formCardStyle}>
                <h4 style={formTitleStyle}>{editingCat ? "Edit Category" : "New Category"}</h4>
                <div style={fieldRowStyle}>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Icon (emoji)</label>
                    <input style={inputStyle} value={catForm.icon}
                      onChange={e => setCatForm(f=>({...f,icon:e.target.value}))} maxLength={4} />
                  </div>
                  <div style={{...fieldStyle, flex:3}}>
                    <label style={labelStyle}>Category Name *</label>
                    <input style={inputStyle} placeholder="e.g. Salads" value={catForm.label}
                      onChange={e => setCatForm(f=>({...f,label:e.target.value}))} />
                  </div>
                </div>
                <div style={formActionsStyle}>
                  <button style={cancelBtnStyle} onClick={() => {setShowAddCat(false);setError("");}}>Cancel</button>
                  <button style={saveBtnStyle} onClick={saveCat}>
                    {editingCat ? "Save Changes" : "Add Category"}
                  </button>
                </div>
              </div>
            )}

            <div style={listStyle}>
              {menuCategories.map(cat => (
                <div key={cat.key} style={listItemStyle}>
                  <span style={catIconStyle}>{cat.icon}</span>
                  <div style={{flex:1}}>
                    <div style={itemNameStyle}>{cat.label}</div>
                    <div style={itemMetaStyle}>
                      {menuItems.filter(i=>i.category===cat.key).length} items · key: {cat.key}
                    </div>
                  </div>
                  <div style={actionBtnsStyle}>
                    <button style={editBtnStyle} onClick={() => openEditCat(cat)}>Edit</button>
                    <button style={deleteBtnStyle} onClick={() => confirmDeleteCat(cat.key)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ ITEMS TAB ══ */}
        {tab === "items" && (
          <div style={tabBodyStyle}>
            {/* Category selector */}
            <div style={catTabsStyle}>
              {menuCategories.map(cat => (
                <button key={cat.key} style={catTabStyle(activeCat===cat.key)}
                  onClick={() => setActiveCat(cat.key)}>
                  {cat.icon} {cat.label.split("—")[0].trim().split(" ").slice(0,2).join(" ")}
                </button>
              ))}
            </div>

            <div style={sectionHeaderStyle}>
              <span style={sectionTitleStyle}>
                {menuCategories.find(c=>c.key===activeCat)?.icon} {menuCategories.find(c=>c.key===activeCat)?.label}
                <span style={itemMetaStyle}> · {catItems.length} items</span>
              </span>
              <button style={addBtnStyle} onClick={openAddItem} disabled={!activeCat}>＋ Add Item</button>
            </div>

            {/* Add / Edit Item Form */}
            {showAddItem && (
              <div style={formCardStyle}>
                <h4 style={formTitleStyle}>{editingItem ? "Edit Item" : "New Item"}</h4>
                <div style={fieldRowStyle}>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Emoji</label>
                    <input style={inputStyle} value={itemForm.emoji} maxLength={4}
                      onChange={e => setItemForm(f=>({...f,emoji:e.target.value}))} />
                  </div>
                  <div style={{...fieldStyle,flex:3}}>
                    <label style={labelStyle}>Item Name *</label>
                    <input style={inputStyle} placeholder="e.g. Mango Lassi" value={itemForm.name}
                      onChange={e => setItemForm(f=>({...f,name:e.target.value}))} />
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Price *</label>
                    <input style={inputStyle} placeholder="₹150" value={itemForm.price}
                      onChange={e => setItemForm(f=>({...f,price:e.target.value}))} />
                  </div>
                </div>
                <div style={fieldRowStyle}>
                  <div style={{...fieldStyle,flex:1}}>
                    <label style={labelStyle}>Badge (optional)</label>
                    <input style={inputStyle} placeholder="e.g. Bestseller" value={itemForm.badge||""}
                      onChange={e => setItemForm(f=>({...f,badge:e.target.value}))} />
                  </div>
                  <div style={{...fieldStyle,flex:1}}>
                    <label style={labelStyle}>Type</label>
                    <select style={inputStyle} value={itemForm.veg ? "veg" : "non-veg"}
                      onChange={e => setItemForm(f=>({...f,veg:e.target.value==="veg"}))}>
                      <option value="veg">🟢 Veg</option>
                      <option value="non-veg">🔴 Non-Veg</option>
                    </select>
                  </div>
                </div>
                <div style={{marginBottom:"0.8rem"}}>
                  <label style={labelStyle}>Description</label>
                  <textarea style={{...inputStyle,resize:"vertical",minHeight:"72px"}}
                    placeholder="Brief description of the dish…" value={itemForm.desc||""}
                    onChange={e => setItemForm(f=>({...f,desc:e.target.value}))} />
                </div>
                {/* Image upload */}
                <div style={imgUploadRowStyle}>
                  {(previewUrl || itemForm.imageUrl) && (
                    <img src={previewUrl || itemForm.imageUrl} alt="preview"
                      style={{width:"72px",height:"72px",objectFit:"cover",borderRadius:"6px",border:"1px solid var(--border)"}} />
                  )}
                  <div>
                    <label style={labelStyle}>Photo</label>
                    <button style={uploadImgBtnStyle} onClick={() => imgInputRef.current?.click()} disabled={busy}>
                      {busy ? "⏳ Uploading…" : (itemForm.imageUrl ? "📷 Replace Photo" : "📷 Upload Photo")}
                    </button>
                    {itemForm.imageUrl && (
                      <button style={{...deleteBtnStyle,marginLeft:"0.5rem"}} onClick={async () => {
                        if (itemForm.imagePublicId) await deleteImage(itemForm.imagePublicId).catch(()=>{});
                        setItemForm(f=>({...f,imageUrl:"",imagePublicId:""})); setPreviewUrl("");
                      }}>Remove</button>
                    )}
                    <input ref={imgInputRef} type="file" accept="image/*"
                      style={{display:"none"}} onChange={handleItemImageSelect} />
                  </div>
                </div>
                <div style={formActionsStyle}>
                  <button style={cancelBtnStyle} onClick={() => {setShowAddItem(false);setError("");}}>Cancel</button>
                  <button style={saveBtnStyle} onClick={saveItem} disabled={busy}>
                    {editingItem ? "Save Changes" : "Add Item"}
                  </button>
                </div>
              </div>
            )}

            <div style={listStyle}>
              {catItems.length === 0 && (
                <p style={{color:"var(--muted)",fontSize:"0.85rem",padding:"1.5rem 0"}}>
                  No items in this category yet. Add one above.
                </p>
              )}
              {catItems.map(item => (
                <div key={item.id} style={listItemStyle}>
                  <div style={itemThumbStyle(item.imageUrl)}>
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.name}
                          style={{width:"100%",height:"100%",objectFit:"cover"}} />
                      : <span style={{fontSize:"1.5rem"}}>{item.emoji}</span>
                    }
                  </div>
                  <div style={{flex:1}}>
                    <div style={itemNameStyle}>
                      {item.name}
                      {item.badge && <span style={badgeStyle}>{item.badge}</span>}
                      <span style={{fontSize:"0.65rem",color:item.veg?"#5a9e4b":"#c0392b",marginLeft:"6px"}}>●</span>
                    </div>
                    <div style={itemMetaStyle}>{item.price} · {item.desc?.slice(0,60)}{item.desc?.length>60?"…":""}</div>
                  </div>
                  <div style={actionBtnsStyle}>
                    <button style={editBtnStyle} onClick={() => openEditItem(item)}>Edit</button>
                    <button style={deleteBtnStyle} onClick={() => confirmDeleteItem(item)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── styles ── */
const backdropStyle    = { position:"fixed",inset:0,zIndex:3000,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem" };
const panelStyle       = { background:"#1a1510",border:"1px solid var(--border)",borderRadius:"14px",width:"100%",maxWidth:"860px",maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden" };
const panelHeaderStyle = { display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1.5rem 1.8rem",borderBottom:"1px solid var(--border)",flexShrink:0 };
const panelTitleStyle  = { fontFamily:"'Playfair Display',serif",fontSize:"1.3rem",color:"var(--cream)",margin:0 };
const closeBtnStyle    = { background:"none",border:"none",color:"var(--muted)",fontSize:"1.1rem",cursor:"pointer",padding:"4px 8px",lineHeight:1 };
const tabsStyle        = { display:"flex",gap:"0",borderBottom:"1px solid var(--border)",flexShrink:0 };
const tabBtnStyle      = a => ({ flex:1,padding:"0.9rem",background:a?"rgba(201,144,58,0.1)":"none",border:"none",borderBottom:a?"2px solid var(--gold)":"2px solid transparent",color:a?"var(--gold)":"var(--muted)",fontSize:"0.82rem",fontWeight:600,cursor:"pointer",letterSpacing:"0.06em",fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s" });
const tabBodyStyle     = { padding:"1.5rem 1.8rem",overflowY:"auto",flex:1 };
const sectionHeaderStyle = { display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.2rem" };
const sectionTitleStyle  = { fontSize:"0.9rem",color:"var(--cream)",fontWeight:600 };
const addBtnStyle      = { padding:"0.5rem 1.2rem",background:"rgba(201,144,58,0.15)",border:"1px solid var(--gold)",borderRadius:"6px",color:"var(--gold)",fontSize:"0.78rem",fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" };
const listStyle        = { display:"flex",flexDirection:"column",gap:"0.6rem" };
const listItemStyle    = { display:"flex",alignItems:"center",gap:"1rem",padding:"0.8rem 1rem",background:"rgba(255,255,255,0.03)",border:"1px solid var(--border)",borderRadius:"8px" };
const catIconStyle     = { fontSize:"1.4rem",width:"36px",textAlign:"center" };
const itemNameStyle    = { fontSize:"0.88rem",color:"var(--cream)",fontWeight:600,marginBottom:"0.2rem" };
const itemMetaStyle    = { fontSize:"0.72rem",color:"var(--muted)" };
const actionBtnsStyle  = { display:"flex",gap:"0.5rem",flexShrink:0 };
const editBtnStyle     = { padding:"0.3rem 0.8rem",background:"none",border:"1px solid var(--border)",borderRadius:"4px",color:"var(--muted)",fontSize:"0.72rem",cursor:"pointer",fontFamily:"'DM Sans',sans-serif" };
const deleteBtnStyle   = { padding:"0.3rem 0.8rem",background:"none",border:"1px solid rgba(168,76,47,0.4)",borderRadius:"4px",color:"#c0392b",fontSize:"0.72rem",cursor:"pointer",fontFamily:"'DM Sans',sans-serif" };
const formCardStyle    = { background:"rgba(255,255,255,0.03)",border:"1px solid var(--border)",borderRadius:"10px",padding:"1.4rem",marginBottom:"1.4rem" };
const formTitleStyle   = { fontSize:"0.88rem",color:"var(--gold)",fontWeight:600,marginBottom:"1rem",letterSpacing:"0.06em",textTransform:"uppercase" };
const fieldRowStyle    = { display:"flex",gap:"0.8rem",flexWrap:"wrap",marginBottom:"0.8rem" };
const fieldStyle       = { display:"flex",flexDirection:"column",gap:"0.3rem",flex:1,minWidth:"120px" };
const labelStyle       = { fontSize:"0.7rem",color:"var(--muted)",letterSpacing:"0.08em",textTransform:"uppercase" };
const inputStyle       = { background:"rgba(255,255,255,0.06)",border:"1px solid var(--border)",borderRadius:"6px",padding:"0.55rem 0.9rem",color:"var(--cream)",fontSize:"0.85rem",fontFamily:"'DM Sans',sans-serif",outline:"none",width:"100%" };
const formActionsStyle = { display:"flex",gap:"0.8rem",justifyContent:"flex-end",marginTop:"1rem" };
const cancelBtnStyle   = { padding:"0.55rem 1.4rem",background:"none",border:"1px solid var(--border)",borderRadius:"6px",color:"var(--muted)",fontSize:"0.8rem",cursor:"pointer",fontFamily:"'DM Sans',sans-serif" };
const saveBtnStyle     = { padding:"0.55rem 1.4rem",background:"rgba(201,144,58,0.85)",border:"none",borderRadius:"6px",color:"#1a1612",fontSize:"0.8rem",fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" };
const catTabsStyle     = { display:"flex",gap:"0.5rem",flexWrap:"wrap",marginBottom:"1.4rem",paddingBottom:"1rem",borderBottom:"1px solid var(--border)" };
const catTabStyle      = a => ({ padding:"0.4rem 1rem",background:a?"rgba(201,144,58,0.15)":"none",border:`1px solid ${a?"var(--gold)":"var(--border)"}`,borderRadius:"20px",color:a?"var(--gold)":"var(--muted)",fontSize:"0.75rem",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap" });
const itemThumbStyle   = url => ({ width:"48px",height:"48px",borderRadius:"6px",border:"1px solid var(--border)",background:"rgba(201,144,58,0.06)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0 });
const badgeStyle       = { marginLeft:"6px",fontSize:"0.6rem",padding:"1px 6px",background:"var(--rust)",color:"white",borderRadius:"3px",letterSpacing:"0.06em" };
const imgUploadRowStyle = { display:"flex",alignItems:"center",gap:"1rem",marginBottom:"0.8rem",padding:"0.8rem",background:"rgba(255,255,255,0.02)",borderRadius:"6px",border:"1px solid var(--border)" };
const uploadImgBtnStyle = { padding:"0.45rem 1rem",background:"rgba(201,144,58,0.1)",border:"1px solid var(--gold)",borderRadius:"6px",color:"var(--gold)",fontSize:"0.75rem",cursor:"pointer",fontFamily:"'DM Sans',sans-serif" };
const errorStyle       = { color:"#e07a5f",fontSize:"0.8rem",padding:"0.5rem 1.8rem",margin:0,background:"rgba(168,76,47,0.08)" };
