import { createContext, useContext, useState, useCallback, useRef } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const show = useCallback((message, options = {}) => {
    const id       = ++idRef.current;
    const type     = options.type     ?? "success";
    const duration = options.duration ?? 3000;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const dismiss = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div style={stackStyle}>
      {toasts.map((t) => <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />)}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const colors = {
    success: { bg:"rgba(90,200,90,0.12)",  border:"rgba(90,200,90,0.35)",  icon:"✓", color:"#5ac95a" },
    error:   { bg:"rgba(168,76,47,0.15)",  border:"rgba(168,76,47,0.45)",  icon:"✕", color:"#e07a5f" },
    info:    { bg:"rgba(201,144,58,0.12)", border:"rgba(201,144,58,0.35)", icon:"ℹ", color:"var(--gold)" },
  };
  const c = colors[toast.type] ?? colors.info;
  return (
    <div style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.85rem 1.2rem",background:c.bg,border:`1px solid ${c.border}`,borderRadius:"8px",backdropFilter:"blur(16px)",boxShadow:"0 8px 32px rgba(0,0,0,0.4)",animation:"fadeUp 0.3s ease",minWidth:"260px",maxWidth:"380px",pointerEvents:"all"}}>
      <span style={{width:"22px",height:"22px",borderRadius:"50%",background:c.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem",color:c.color,flexShrink:0,fontWeight:700}}>{c.icon}</span>
      <span style={{flex:1,fontSize:"0.82rem",color:"var(--cream)",lineHeight:1.4,fontFamily:"'DM Sans',sans-serif"}}>{toast.message}</span>
      <button style={{background:"none",border:"none",color:"var(--muted)",fontSize:"0.75rem",cursor:"pointer",padding:"2px",flexShrink:0}} onClick={() => onDismiss(toast.id)}>✕</button>
    </div>
  );
}

const stackStyle = {
  position:"fixed", bottom:"2rem", right:"2rem", zIndex:9999,
  display:"flex", flexDirection:"column", gap:"0.75rem", pointerEvents:"none",
};
