const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

async function decode(file) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {}
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function compressImage(file, { maxSize = 1600, quality = 0.85 } = {}) {
  if (!file?.type?.startsWith("image/")) {
    throw new Error("Faqat rasm faylini tanlang");
  }

  let source;
  try {
    source = await decode(file);
  } catch {
    throw new Error("Bu rasm formatini o'qib bo'lmadi. JPG yoki PNG tanlang.");
  }

  const width = source.width;
  const height = source.height;
  const scale = Math.min(1, maxSize / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext("2d").drawImage(source, 0, 0, canvas.width, canvas.height);
  source.close?.();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));

  if (
    !blob ||
    (blob.size >= file.size && file.size <= MAX_UPLOAD_BYTES && file.type === "image/jpeg")
  ) {
    if (file.size > MAX_UPLOAD_BYTES) throw new Error("Rasm juda katta (8 MB dan oshmasin)");
    return file;
  }
  return new File([blob], "progress.jpg", { type: "image/jpeg" });
}
