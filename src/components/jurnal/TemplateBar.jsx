import React from "react";
import { Download, LayoutList, Play, Plus } from "lucide-react";
import { TEMPLATE_PRESETS } from "../../constants/templatePresets.js";

function TemplateChip({ template, badge, onStart }) {
  return (
    <button
      type="button"
      onClick={() => onStart(template)}
      title={(template.exercises ?? []).map((e) => e.name).join(", ")}
      className="flex items-center gap-2 shrink-0 rounded-md px-3 py-2 cursor-pointer transition-colors text-left border bg-brand-surface border-brand-line hover:border-brand-accent"
    >
      <Play size={12} className="text-brand-accent shrink-0" />
      <span className="text-[13px] font-semibold text-brand-text whitespace-nowrap">
        {template.name}
      </span>
      <span className="text-[10px] text-brand-muted whitespace-nowrap">
        {template.exercises?.length ?? 0} mashq
      </span>
      {badge && (
        <span className="text-[9px] uppercase tracking-wide text-brand-muted border border-brand-line rounded px-1">
          {badge}
        </span>
      )}
    </button>
  );
}

export default function TemplateBar({ templates, loading, onStart, onManage, onAdoptPresets }) {
  const showPresets = !loading && templates.length === 0;
  const list = showPresets ? TEMPLATE_PRESETS : templates;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[13px] text-brand-text">
          <LayoutList size={14} /> Tayyor kunlik mashq yaratish
        </div>
        <button
          type="button"
          onClick={onManage}
          className="flex items-center gap-1 text-[11px] text-brand-muted bg-transparent border-none cursor-pointer"
        >
          <Plus size={12} /> Boshqarish
        </button>
      </div>

      {!loading && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {list.map((t) => (
            <TemplateChip
              key={t.id ?? t.key}
              template={t}
              badge={showPresets ? "namuna" : null}
              onStart={onStart}
            />
          ))}
        </div>
      )}

      {showPresets && (
        <button
          type="button"
          onClick={onAdoptPresets}
          className="w-full flex items-center justify-center gap-1.5 mt-1.5 text-[11px] text-brand-muted bg-transparent border border-dashed border-brand-line rounded-md py-2 cursor-pointer hover:text-brand-text"
        >
          <Download size={12} /> Namunalarni o'zimga saqlash
        </button>
      )}
    </div>
  );
}
