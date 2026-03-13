import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { galleryData }  from "../data/galleryData.js";
import menuDataSeed     from "../data/menuData.js";
import menuCatSeed      from "../data/menuCategories.js";
import teamDataSeed     from "../data/teamData.js";
import { uploadImage, deleteImage, loadSharedImages, saveSharedImages } from "../api/imageApi.js";

/* ─────────────────────────────────────────────
   STORAGE KEYS  — one key per logical group so
   each image gets its own localStorage key.
───────────────────────────────────────────── */
const KEYS = {
  credentials:    "bm_credentials",
  heroSlides:     "bm_heroSlides",
  specialtyImage: "bm_specialtyImage",
  cardImages:     "bm_cardImages",
  popularItemIds: "bm_popularItemIds",
  aboutHeroImage: "bm_aboutHeroImage",
  teamAvatars:    "bm_teamAvatars",
  featureImages:  "bm_featureImages",
  galleryItems:   "bm_galleryItems",
  menuCategories: "bm_menuCategories",
  menuItems:      "bm_menuItems",
  aboutInfo:      "bm_aboutInfo",
  teamMembers:    "bm_teamMembers",
  siteContact:    "bm_siteContact",
  socialLinks:    "bm_socialLinks",
};


/* ─────────────────────────────────────────────
   SESSION CONFIG
   - Stored in sessionStorage so it survives page
     refresh but clears when the tab/browser closes.
   - SESSION_DURATION: inactivity timeout in ms.
───────────────────────────────────────────── */
const SESSION_KEY      = "bm_admin_session";
const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours of inactivity

function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { loggedIn, expiresAt } = JSON.parse(raw);
    if (!loggedIn || Date.now() > expiresAt) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return { loggedIn, expiresAt };
  } catch {
    return null;
  }
}

function setSession() {
  const expiresAt = Date.now() + SESSION_DURATION;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ loggedIn: true, expiresAt }));
  return expiresAt;
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    // Sets are not JSON-serialisable — convert to array first
    const toStore = value instanceof Set ? [...value] : value;
    localStorage.setItem(key, JSON.stringify(toStore));
  } catch (e) {
    // Quota exceeded — fail silently
    console.warn("localStorage quota exceeded for key:", key);
  }
}

/* Thin wrapper: useState that reads initial value from localStorage
   and writes back on every change.                                   */
function usePersisted(key, fallback) {
  const [state, setStateRaw] = useState(() => {
    const stored = load(key, fallback);
    // Restore Sets that were serialised as arrays
    if (fallback instanceof Set) return new Set(stored);
    return stored;
  });

  // Save to localStorage AFTER React commits — never inside the updater.
  // useRef tracks whether this is the initial mount so we don't
  // overwrite stored data with the initial value on first render.
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    save(key, state);
  }, [key, state]); // eslint-disable-line react-hooks/exhaustive-deps

  const setState = useCallback((updater) => {
    setStateRaw((prev) =>
      typeof updater === "function" ? updater(prev) : updater
    );
  }, []);

  return [state, setState];
}

/* ─────────────────────────────────────────────
   DEFAULTS
───────────────────────────────────────────── */
const DEFAULT_ABOUT_INFO = {
  storyParagraphs: [
    "Bites & More Cafe Lounge began as a humble dream — a small corner in Agra where people could gather over great food and great company. What started as a passion project has grown into one of the city\'s most beloved dining destinations.",
    "Our founders believed that food has the power to connect people, cultures, and stories. That belief is woven into every dish we serve — from our fiery Chinese gravies to our delicate Italian pastas, from our artisanal coffees to our indulgent desserts.",
    "Today, we are proud to serve thousands of guests each month, consistently delivering not just meals, but memories. Every corner of our cafe tells a story, and we invite you to be part of it.",
  ],
  yearsLabel: "8+",
  yearsDesc:  "Years of culinary excellence in Agra",
  values: [
    { title: "Quality First",      desc: "We never compromise on ingredient quality. Every dish is crafted with the finest, freshest produce and authentic spices sourced from trusted suppliers." },
    { title: "Inclusive Dining",   desc: "Our menu celebrates diversity with equal attention to vegetarian and non-vegetarian offerings, ensuring every guest finds their perfect dish." },
    { title: "Warm Hospitality",   desc: "More than food, we offer an experience. Our team is trained to make every guest feel valued, welcomed, and truly at home." },
  ],
};

const DEFAULT_CONTACT = {
  address:       "Bites & More Cafe Lounge\nAgra, Uttar Pradesh, India",
  phone:         "",
  weekdayHours:  "11:00 AM – 11:00 PM",
  weekendHours:  "10:00 AM – 12:00 AM",
  reservationNote: "Call us or walk in — we always have a table for you.",
};

const DEFAULT_SOCIAL = {
  instagram: "#",
  facebook:  "#",
  twitter:   "",
  youtube:   "",
};

const DEFAULT_CREDS = {
  username:         "admin",
  password:         "cafe2025",
  securityQuestion: "pet",
  securityAnswer:   "fluffy",
};

const DEFAULT_HERO_SLIDES = [
  { emoji: "🍽️", img: null },
  { emoji: "☕",  img: null },
  { emoji: "🍕",  img: null },
  { emoji: "🍹",  img: null },
];

/* ─────────────────────────────────────────────
   CONTEXT
───────────────────────────────────────────── */
const AdminContext = createContext(null);

export function AdminProvider({ children }) {

  /* ── Auth — sessionStorage + inactivity expiry ── */
  const [isAdmin,    setIsAdmin]    = useState(() => getSession() !== null);
  const [expiresAt,  setExpiresAt]  = useState(() => getSession()?.expiresAt ?? null);
  const [uploadError, setUploadError] = useState("");
  const expireTimer = useRef(null);

  /* Arm/rearm the inactivity logout timer whenever expiresAt changes */
  useEffect(() => {
    clearTimeout(expireTimer.current);
    if (!expiresAt) return;
    const msLeft = expiresAt - Date.now();
    if (msLeft <= 0) { doLogout(); return; }
    expireTimer.current = setTimeout(doLogout, msLeft);
    return () => clearTimeout(expireTimer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt]);

  /* Reset expiry on any user activity while logged in */
  useEffect(() => {
    if (!isAdmin) return;
    const refresh = () => {
      const next = setSession();
      setExpiresAt(next);
    };
    const EVENTS = ["mousedown", "keydown", "touchstart", "scroll"];
    EVENTS.forEach(ev => window.addEventListener(ev, refresh, { passive: true }));
    return () => EVENTS.forEach(ev => window.removeEventListener(ev, refresh));
  }, [isAdmin]);

  function doLogout() {
    clearSession();
    clearTimeout(expireTimer.current);
    setIsAdmin(false);
    setExpiresAt(null);
  }

  /* Persisted state */
  const [credentials,    setCredentials]    = usePersisted(KEYS.credentials,    DEFAULT_CREDS);
  const [heroSlides,     setHeroSlides]     = usePersisted(KEYS.heroSlides,     DEFAULT_HERO_SLIDES);
  const [specialtyImageData, setSpecialtyImage] = usePersisted(KEYS.specialtyImage, null);
  const [cardImages,     setCardImages]     = usePersisted(KEYS.cardImages,     {});
  const [popularItemIds, setPopularItemIds] = usePersisted(KEYS.popularItemIds, new Set());
  // Seed galleryItems from galleryData on first ever load (when null)
  const defaultGalleryItems = galleryData.map(item => ({
    ...item,
    url:       null,
    isDefault: true,
  }));
  const [galleryItems, setGalleryItems] = usePersisted(KEYS.galleryItems, defaultGalleryItems);
  const [aboutHeroImageData, setAboutHeroImage] = usePersisted(KEYS.aboutHeroImage, null);
  const [teamAvatars,    setTeamAvatars]    = usePersisted(KEYS.teamAvatars,    {});
  const [featureImages,  setFeatureImages]  = usePersisted(KEYS.featureImages,  {});   // { [index]: url }
  /* ── Shared image sync: load from JSONBin on mount, visible to ALL visitors ── */
  useEffect(() => {
    loadSharedImages().then(shared => {
      if (!shared) return;
      if (shared.heroSlides)      setHeroSlides(shared.heroSlides);
      if (shared.specialtyImage)  setSpecialtyImage(shared.specialtyImage);
      if (shared.featureImages)   setFeatureImages(shared.featureImages);
      if (shared.galleryItems)    setGalleryItems(shared.galleryItems);
      if (shared.aboutHeroImage)  setAboutHeroImage(shared.aboutHeroImage);
      if (shared.teamAvatars)     setTeamAvatars(shared.teamAvatars);
      if (shared.cardImages)      setCardImages(shared.cardImages);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Helper: called after every image upload to persist to JSONBin */
  const syncShared = useCallback((patch) => {
    loadSharedImages().then(current => {
      saveSharedImages({ ...(current || {}), ...patch });
    });
  }, []);

  /* ── MENU (editable) ── */
  const [menuCategories, setMenuCategories] = usePersisted(KEYS.menuCategories, null);
  const [menuItems,      setMenuItems]      = usePersisted(KEYS.menuItems,      null);

  // Seed from static data on first load
  const resolvedCategories = menuCategories ?? menuCatSeed;
  const resolvedMenuItems  = menuItems      ?? menuDataSeed;

  /* ── ABOUT (editable) ── */
  const [aboutInfo,    setAboutInfo]    = usePersisted(KEYS.aboutInfo,    DEFAULT_ABOUT_INFO);
  const [teamMembers,  setTeamMembers]  = usePersisted(KEYS.teamMembers,  null);
  const resolvedTeam = teamMembers ?? teamDataSeed;
  const [siteContact,  setSiteContact]  = usePersisted(KEYS.siteContact,  DEFAULT_CONTACT);
  const [socialLinks,  setSocialLinks]  = usePersisted(KEYS.socialLinks,  DEFAULT_SOCIAL);

  /* ── AUTH ── */
  const login = useCallback(() => {
    const next = setSession();
    setIsAdmin(true);
    setExpiresAt(next);
  }, []);

  const logout = useCallback(() => doLogout(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateUsername  = useCallback((v) =>
    setCredentials(p => ({ ...p, username: v })), [setCredentials]);

  const updatePassword  = useCallback((v) =>
    setCredentials(p => ({ ...p, password: v })), [setCredentials]);

  const updateSecurityQ = useCallback((q, a) =>
    setCredentials(p => ({ ...p, securityQuestion: q, securityAnswer: a })), [setCredentials]);

  /* ── HOME ── */
  const updateHeroSlide = useCallback(async (idx, file) => {
    const old = heroSlides[idx]?.publicId;
    if (old) await deleteImage(old).catch(console.warn);
    try {
      const { url, publicId } = await uploadImage(file, "hero", `slide-${idx}`);
      setHeroSlides(prev => prev.map((s, i) => i === idx ? { ...s, img: url, publicId } : s));
      setUploadError("");
    } catch(e) { setUploadError(e.message); }
  }, [heroSlides, setHeroSlides]);

  const updateSpecialtyImage = useCallback(async (file) => {
    const old = specialtyImageData?.publicId;
    if (old) await deleteImage(old).catch(console.warn);
    try {
      const { url, publicId } = await uploadImage(file, "specialty", "main");
      setSpecialtyImage({ url, publicId }); setUploadError("");
    } catch(e) { setUploadError(e.message); }
  }, [specialtyImageData, setSpecialtyImage]);

  /* ── MENU ── */
  const updateCardImage = useCallback(async (id, fileOrNull) => {
    const old = cardImages[id]?.publicId;
    if (old) await deleteImage(old).catch(console.warn);
    if (!fileOrNull) {
      setCardImages(prev => { const n = {...prev}; delete n[id]; return n; });
      return;
    }
    try {
      const { url, publicId } = await uploadImage(fileOrNull, "menu", `card-${id}`);
      setCardImages(prev => ({ ...prev, [id]: { url, publicId } })); setUploadError("");
    } catch(e) { setUploadError(e.message); }
  }, [cardImages, setCardImages]);

  const togglePopular = useCallback((id) =>
    setPopularItemIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    }), [setPopularItemIds]);

  /* ── MENU EDIT ── */
  const addMenuCategory = useCallback((cat) =>
    setMenuCategories(prev => [...(prev ?? menuCatSeed), cat]), [setMenuCategories]);

  const updateMenuCategory = useCallback((key, updates) =>
    setMenuCategories(prev => (prev ?? menuCatSeed).map(c => c.key === key ? {...c, ...updates} : c)),
  [setMenuCategories]);

  const deleteMenuCategory = useCallback((key) => {
    setMenuCategories(prev => (prev ?? menuCatSeed).filter(c => c.key !== key));
    setMenuItems(prev => (prev ?? menuDataSeed).filter(i => i.category !== key));
  }, [setMenuCategories, setMenuItems]);

  const addMenuItem = useCallback((item) =>
    setMenuItems(prev => [...(prev ?? menuDataSeed), item]), [setMenuItems]);

  const updateMenuItem = useCallback((id, updates) =>
    setMenuItems(prev => (prev ?? menuDataSeed).map(i => i.id === id ? {...i, ...updates} : i)),
  [setMenuItems]);

  const deleteMenuItem = useCallback(async (id) => {
    const item = (menuItems ?? menuDataSeed).find(i => i.id === id);
    if (item?.imagePublicId) await deleteImage(item.imagePublicId).catch(console.warn);
    setMenuItems(prev => (prev ?? menuDataSeed).filter(i => i.id !== id));
  }, [menuItems, setMenuItems]);

  const updateMenuItemImage = useCallback(async (id, file) => {
    const item = (menuItems ?? menuDataSeed).find(i => i.id === id);
    if (item?.imagePublicId) await deleteImage(item.imagePublicId).catch(console.warn);
    const { url, publicId } = await uploadImage(file, "menu", `item-${id}`);
    setMenuItems(prev => (prev ?? menuDataSeed).map(i => i.id === id ? {...i, imageUrl: url, imagePublicId: publicId} : i));
  }, [menuItems, setMenuItems]);

  /* ── ABOUT EDIT ── */
  const updateAboutInfo   = useCallback((updates) =>
    setAboutInfo(prev => ({...prev, ...updates})), [setAboutInfo]);

  const addTeamMember     = useCallback((member) =>
    setTeamMembers(prev => [...(prev ?? teamDataSeed), member]), [setTeamMembers]);

  const updateTeamMember  = useCallback((id, updates) =>
    setTeamMembers(prev => (prev ?? teamDataSeed).map(m => m.id === id ? {...m, ...updates} : m)),
  [setTeamMembers]);

  const deleteTeamMember  = useCallback(async (id) => {
    const m = (teamMembers ?? teamDataSeed).find(m => m.id === id);
    if (m?.avatarPublicId) await deleteImage(m.avatarPublicId).catch(console.warn);
    setTeamMembers(prev => (prev ?? teamDataSeed).filter(m => m.id !== id));
  }, [teamMembers, setTeamMembers]);

  const updateSiteContact = useCallback((updates) =>
    setSiteContact(prev => ({...prev, ...updates})), [setSiteContact]);

  const updateSocialLinks = useCallback((updates) =>
    setSocialLinks(prev => ({...prev, ...updates})), [setSocialLinks]);

  /* ── GALLERY ── */
  // Gallery: set a URL on an item (after server upload)
  const setGalleryItemUrl = useCallback((id, url, publicId) =>
    setGalleryItems(prev => {
      const next = prev.map(item =>
        String(item.id) === String(id) ? { ...item, url, ...(publicId ? {publicId} : {}) } : item
      );
      syncShared({ galleryItems: next });
      return next;
    }), [setGalleryItems, syncShared]);

  // Gallery: add new items (metadata only — url set separately after upload)
  const addGalleryItems = useCallback((newItems) =>
    setGalleryItems(prev => {
      const next = [...prev, ...newItems];
      syncShared({ galleryItems: next });
      return next;
    }), [setGalleryItems, syncShared]);

  // Gallery: remove an item by id
  const removeGalleryItem = useCallback((id) =>
    setGalleryItems(prev => {
      const next = prev.filter(item => String(item.id) !== String(id));
      syncShared({ galleryItems: next });
      return next;
    }), [setGalleryItems, syncShared]);

  /* ── ABOUT ── */
  const updateAboutHeroImage = useCallback(async (file) => {
    const old = aboutHeroImageData?.publicId;
    if (old) await deleteImage(old).catch(console.warn);
    try {
      const { url, publicId } = await uploadImage(file, "about", "hero");
      setAboutHeroImage({ url, publicId }); setUploadError("");
    } catch(e) { setUploadError(e.message); }
  }, [aboutHeroImageData, setAboutHeroImage]);

  const updateTeamAvatar = useCallback(async (id, file) => {
    const old = teamAvatars[id]?.publicId;
    if (old) await deleteImage(old).catch(console.warn);
    try {
      const { url, publicId } = await uploadImage(file, "team", `avatar-${id}`);
      setTeamAvatars(prev => ({ ...prev, [id]: { url, publicId } })); setUploadError("");
    } catch(e) { setUploadError(e.message); }
  }, [teamAvatars, setTeamAvatars]);

  const updateFeatureImage = useCallback(async (idx, file) => {
    const old = featureImages[idx]?.publicId;
    if (old) await deleteImage(old).catch(console.warn);
    try {
      const { url, publicId } = await uploadImage(file, "feature", `card-${idx}`);
      setFeatureImages(prev => ({ ...prev, [idx]: { url, publicId } })); setUploadError("");
    } catch(e) { setUploadError(e.message); }
  }, [featureImages, setFeatureImages]);

  /* ── RESET (wipe all persisted data) ── */
  const resetAll = useCallback(() => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    setCredentials(DEFAULT_CREDS);
    setHeroSlides(DEFAULT_HERO_SLIDES);
    setSpecialtyImage(null);
    setCardImages({});
    setPopularItemIds(new Set());
    setGalleryItems(null);
    setMenuCategories(null);
    setMenuItems(null);
    setAboutInfo(DEFAULT_ABOUT_INFO);
    setTeamMembers(null);
    setSiteContact(DEFAULT_CONTACT);
    setSocialLinks(DEFAULT_SOCIAL);
    setAboutHeroImage(null);
    setTeamAvatars({});
    setFeatureImages({});
  }, [setCredentials, setHeroSlides, setSpecialtyImage,
      setCardImages, setPopularItemIds, setGalleryItems,
      setMenuCategories, setMenuItems,
      setAboutInfo, setTeamMembers, setSiteContact, setSocialLinks,
      setAboutHeroImage, setTeamAvatars, setFeatureImages]);

  return (
    <AdminContext.Provider value={{
      /* auth */
      isAdmin, expiresAt, credentials, login, logout,
      updateUsername, updatePassword, updateSecurityQ,
      /* home */
      heroSlides, updateHeroSlide,
      specialtyImage: specialtyImageData?.url ?? specialtyImageData ?? null,
      specialtyImagePublicId: specialtyImageData?.publicId ?? null,
      updateSpecialtyImage,
      /* menu */
      cardImages,
      cardImageUrl: (id) => { const v = cardImages[id]; return v?.url ?? v ?? null; },
      updateCardImage,
      popularItemIds, togglePopular,
      /* menu edit */
      menuCategories: resolvedCategories, menuItems: resolvedMenuItems,
      addMenuCategory, updateMenuCategory, deleteMenuCategory,
      addMenuItem, updateMenuItem, deleteMenuItem, updateMenuItemImage,
      /* about edit */
      aboutInfo, updateAboutInfo,
      teamMembers: resolvedTeam, addTeamMember, updateTeamMember, deleteTeamMember,
      siteContact, updateSiteContact,
      socialLinks, updateSocialLinks,
      /* gallery */
      galleryItems, setGalleryItems,
      setGalleryItemUrl, addGalleryItems, removeGalleryItem,
      /* about */
      aboutHeroImage: aboutHeroImageData?.url ?? aboutHeroImageData ?? null,
      updateAboutHeroImage,
      teamAvatars,
      teamAvatarUrl: (id) => { const v = teamAvatars[id]; return v?.url ?? v ?? null; },
      updateTeamAvatar,
      featureImages,
      featureImageUrl: (idx) => { const v = featureImages[idx]; return v?.url ?? v ?? null; },
      updateFeatureImage,
      /* utility */
      resetAll,
      uploadError, setUploadError,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
