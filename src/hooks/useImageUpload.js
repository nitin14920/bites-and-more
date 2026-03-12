import { useRef, useCallback } from "react";

/**
 * useImageUpload
 * Wraps a hidden <input type="file"> and returns trigger + handlers.
 *
 * @param {(file: File) => void} onUpload  — called with the raw File object
 * @returns {{ inputRef, trigger, handleChange }}
 */
export default function useImageUpload(onUpload) {
  const inputRef = useRef(null);

  const trigger = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      onUpload(file);           // pass File directly — no FileReader here
      e.target.value = "";      // reset so same file can be re-selected
    },
    [onUpload]
  );

  return { inputRef, trigger, handleChange };
}
