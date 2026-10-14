import React, { useState } from "react";
import { Upload } from "lucide-react";
import { Modal } from "../../ui/dialog.jsx";
import { Button } from "../../ui/button.jsx";
import { Input } from "../../ui/input.jsx";
import { DateField } from "../../ui/date-field.jsx";
import { SegmentedControl } from "../../ui/segmented.jsx";
import { PHOTO_KINDS, DEFAULT_PHOTO_KIND } from "../../constants/photoKinds.js";
import { todayISO } from "../../utils/date.js";

const KIND_OPTIONS = PHOTO_KINDS.map((k) => ({ value: k.key, label: k.label }));

// Tanlangan suratni ko'rib, sana va rakursni belgilab yuklash.
// Komponent har fayl uchun qayta yaratiladi (chaqiruvchi shartli render qiladi).
// previewUrl'ni chaqiruvchi fayl tanlanganda yaratadi va yopilganda bo'shatadi.
export default function PhotoUploadSheet({
  file,
  previewUrl,
  defaultKind,
  uploading,
  error,
  onUpload,
  onClose,
}) {
  const [date, setDate] = useState(todayISO);
  const [kind, setKind] = useState(
    PHOTO_KINDS.some((k) => k.key === defaultKind) ? defaultKind : DEFAULT_PHOTO_KIND,
  );
  const [note, setNote] = useState("");

  return (
    <Modal
      open
      title="Progress surati"
      onClose={uploading ? undefined : onClose}
      footer={
        <Button
          onClick={() => onUpload({ file, date, kind, note })}
          disabled={uploading || !date}
          className="w-full font-display uppercase tracking-wide text-sm"
        >
          <Upload size={15} /> {uploading ? "Yuklanmoqda..." : "Yuklash"}
        </Button>
      }
    >
      <img
        src={previewUrl}
        alt="Tanlangan surat"
        className="w-full max-h-[42vh] object-contain rounded-md bg-brand-bg mb-3"
      />

      <label className="text-[11px] text-brand-muted">Sana</label>
      <DateField value={date} onChange={setDate} className="mt-1 mb-3" />

      <label className="text-[11px] text-brand-muted">Rakurs</label>
      <SegmentedControl value={kind} onChange={setKind} options={KIND_OPTIONS} className="mt-1 mb-3" />

      <Input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Izoh (ixtiyoriy)"
        maxLength={300}
      />

      {error && <div className="text-brand-accent2 text-xs mt-2">{error}</div>}
    </Modal>
  );
}
