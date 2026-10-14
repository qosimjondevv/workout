import React, { useRef, useState } from "react";
import { Camera, Columns2, ImagePlus, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "../../ui/card.jsx";
import { Button } from "../../ui/button.jsx";
import { Modal, ConfirmDialog } from "../../ui/dialog.jsx";
import { Select } from "../../ui/select.jsx";
import { SegmentedControl } from "../../ui/segmented.jsx";
import { SkeletonList } from "../../ui/skeleton.jsx";
import { PHOTO_KINDS } from "../../constants/photoKinds.js";
import { diffDays, fmt } from "../../utils/date.js";
import PhotoUploadSheet from "./PhotoUploadSheet.jsx";

const FILTERS = [{ value: "all", label: "Hammasi" }, ...PHOTO_KINDS.map((k) => ({ value: k.key, label: k.label }))];
const kindLabel = (key) => PHOTO_KINDS.find((k) => k.key === key)?.label ?? "";

function Thumb({ photo, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(photo)}
      className="relative aspect-[3/4] rounded-md overflow-hidden bg-brand-surface2 border-none p-0 cursor-pointer"
      aria-label={`${fmt(photo.date)}, ${kindLabel(photo.kind)}`}
    >
      <img src={photo.url} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent text-[10px] text-white px-1.5 pt-3 pb-1 text-left">
        {fmt(photo.date)}
      </span>
    </button>
  );
}

// "Oldin / Keyin": bir xil rakursdagi ikki surat yonma-yon. Standart holatda
// eng eskisi va eng yangisi, xohlagan juftlikni tanlash mumkin.
function PhotoCompare({ photos }) {
  const byDateAsc = [...photos].reverse();
  const [beforeId, setBeforeId] = useState(byDateAsc[0].id);
  const [afterId, setAfterId] = useState(photos[0].id);
  const before = photos.find((p) => p.id === beforeId) ?? byDateAsc[0];
  const after = photos.find((p) => p.id === afterId) ?? photos[0];
  const days = Math.abs(diffDays(after.date, before.date));

  const options = (list) =>
    list.map((p) => (
      <option key={p.id} value={p.id}>
        {fmt(p.date)}
      </option>
    ));

  return (
    <div className="mt-3 pt-3 border-t border-brand-line">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 text-[12px] text-brand-text font-semibold">
          <Columns2 size={13} /> Oldin / Keyin
        </span>
        {days > 0 && <span className="text-[11px] text-brand-accent">{days} kun farq</span>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { photo: before, value: beforeId, onChange: setBeforeId, label: "Oldin" },
          { photo: after, value: afterId, onChange: setAfterId, label: "Keyin" },
        ].map((side) => (
          <div key={side.label}>
            <img
              src={side.photo.url}
              alt={`${side.label}: ${fmt(side.photo.date)}`}
              loading="lazy"
              className="w-full aspect-[3/4] object-cover rounded-md bg-brand-surface2"
            />
            <Select
              value={side.value}
              onChange={(e) => side.onChange(e.target.value)}
              aria-label={`${side.label} surati`}
              className="w-full mt-1.5"
            >
              {options(byDateAsc)}
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhotoViewer({ photo, onClose, onDelete }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <Modal open title={`${fmt(photo.date)} · ${kindLabel(photo.kind)}`} onClose={onClose}>
      <img src={photo.url} alt="" className="w-full max-h-[60vh] object-contain rounded-md bg-brand-bg" />
      {photo.note && <div className="text-[12px] text-brand-muted mt-2">{photo.note}</div>}
      <Button variant="destructive" size="sm" onClick={() => setConfirm(true)} className="mt-3">
        <Trash2 size={13} /> O'chirish
      </Button>
      <ConfirmDialog
        open={confirm}
        title="Suratni o'chirish"
        message="Surat butunlay o'chiriladi. Bu amalni orqaga qaytarib bo'lmaydi."
        onConfirm={() => {
          setConfirm(false);
          onDelete(photo.id);
          onClose();
        }}
        onCancel={() => setConfirm(false)}
      />
    </Modal>
  );
}

export default function PhotoSection({ photos, onUploaded }) {
  const inputRef = useRef(null);
  // { file, url } — tanlangan, hali yuklanmagan surat
  const [pending, setPending] = useState(null);
  const [viewing, setViewing] = useState(null);

  function pickFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // o'sha faylni qayta tanlash ham ishlashi uchun
    if (!file) return;
    photos.clearUploadError();
    setPending({ file, url: URL.createObjectURL(file) });
  }

  function closePending() {
    if (pending) URL.revokeObjectURL(pending.url);
    setPending(null);
  }

  async function handleUpload(data) {
    const ok = await photos.upload(data);
    if (ok) {
      closePending();
      onUploaded?.();
    }
  }

  const comparable = photos.kind !== "all" && photos.visible.length >= 2;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 normal-case text-sm">
          <Camera size={15} /> Progress suratlari
        </CardTitle>
        <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
          <ImagePlus size={14} /> Qo'shish
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={pickFile}
          className="hidden"
        />
      </CardHeader>

      {photos.loading ? (
        <SkeletonList count={1} />
      ) : photos.all.length === 0 ? (
        <div className="text-[12px] text-brand-muted text-center py-4 leading-relaxed">
          Har 2-4 haftada bir xil joyda, bir xil yorug'likda suratga tushing —
          o'zgarish raqamlardan ko'ra yaqqolroq ko'rinadi.
        </div>
      ) : (
        <>
          <SegmentedControl
            value={photos.kind}
            onChange={photos.setKind}
            options={FILTERS}
            size="sm"
            className="mb-3"
          />
          {photos.visible.length === 0 ? (
            <div className="text-[12px] text-brand-muted text-center py-3">
              Bu rakursda hali surat yo'q.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {photos.visible.map((p) => (
                <Thumb key={p.id} photo={p} onOpen={setViewing} />
              ))}
            </div>
          )}
          {comparable ? (
            // Rakurs almashganda taqqoslash holati yangidan boshlanadi.
            <PhotoCompare key={photos.kind} photos={photos.visible} />
          ) : (
            photos.kind === "all" &&
            photos.all.length >= 2 && (
              <div className="text-[11px] text-brand-muted text-center mt-3">
                Oldin/Keyin taqqoslash uchun rakursni tanlang
              </div>
            )
          )}
        </>
      )}

      {pending && (
        <PhotoUploadSheet
          file={pending.file}
          previewUrl={pending.url}
          defaultKind={photos.kind}
          uploading={photos.uploading}
          error={photos.uploadError}
          onUpload={handleUpload}
          onClose={closePending}
        />
      )}

      {viewing && (
        <PhotoViewer photo={viewing} onClose={() => setViewing(null)} onDelete={photos.remove} />
      )}
    </Card>
  );
}
