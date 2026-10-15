import { useCallback, useMemo, useState } from "react";
import { usePhotos } from "../context/collections.jsx";
import { compressImage } from "../utils/image.js";

export function useProgressPhotos() {
  const { items, loading, save, remove } = usePhotos();
  const [kind, setKind] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const sorted = useMemo(
    () =>
      [...items].sort((a, b) =>
        a.date === b.date ? String(b.id).localeCompare(String(a.id)) : a.date < b.date ? 1 : -1,
      ),
    [items],
  );

  const visible = useMemo(
    () => (kind === "all" ? sorted : sorted.filter((p) => p.kind === kind)),
    [sorted, kind],
  );

  const upload = useCallback(
    async ({ file, ...meta }) => {
      setUploadError("");
      setUploading(true);
      try {
        const compressed = await compressImage(file);
        const result = await save({ file: compressed, ...meta });
        return result !== null;
      } catch (e) {
        setUploadError(e?.message || "Suratni tayyorlab bo'lmadi");
        return false;
      } finally {
        setUploading(false);
      }
    },
    [save],
  );

  return {
    loading,
    all: sorted,
    visible,
    kind,
    setKind,
    uploading,
    uploadError,
    clearUploadError: () => setUploadError(""),
    upload,
    remove,
  };
}
