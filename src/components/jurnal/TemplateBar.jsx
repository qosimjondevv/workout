import React from "react";
import { Download, LayoutList, Play, Plus } from "lucide-react";
import { TEMPLATE_PRESETS } from "../../constants/templatePresets.js";
import { formatTemplateDays, normalizeTemplateDays, templatesForDay } from "../../utils/catalog.js";
import { WEEKDAY_SHORT, todayISO, weekdayIndex } from "../../utils/date.js";
import { cn } from "../../utils/cn.js";

function TemplateChip({ template, isToday, badge, onStart }) {
  const days = formatTemplateDays(template.days);
  return (
    <button
      type="button"
      onClick={() => onStart(template)}
      title={(template.exercises ?? []).map((e) => e.name).join(", ")}
      className={cn(
        "flex items-center gap-2 shrink-0 rounded-md px-3 py-2 cursor-pointer transition-colors text-left border",
        isToday
          ? "bg-brand-accent/10 border-brand-accent"
          : "bg-brand-surface border-brand-line hover:border-brand-accent",
      )}
    >
      <Play size={12} className="text-brand-accent shrink-0" />
      <span className="min-w-0">
        <span className="flex items-center gap-1.5">
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
        </span>
        {days && (
          <span
            className={cn(
              "block text-[9px] font-semibold tracking-wide mt-0.5 whitespace-nowrap",
              isToday ? "text-brand-accent" : "text-brand-muted",
            )}
          >
            {isToday ? "BUGUN · " : ""}
            {days}
          </span>
        )}
      </span>
    </button>
  );
}

function WeekStrip({ list, today, onStart }) {
  return (
    <div className="grid grid-cols-7 gap-1 mb-2">
      {WEEKDAY_SHORT.map((label, day) => {
        const items = templatesForDay(list, day);
        const first = items[0];
        const isToday = day === today;
        return (
          <button
            key={label}
            type="button"
            disabled={!first}
            onClick={() => first && onStart(first)}
            title={items.map((t) => t.name).join(", ") || "Dam olish kuni"}
            className={cn(
              "flex flex-col items-center justify-center rounded-md py-1.5 px-0.5 border min-w-0 transition-colors",
              isToday
                ? "border-brand-accent bg-brand-accent/10"
                : "border-brand-line bg-brand-surface",
              first ? "cursor-pointer hover:border-brand-accent" : "cursor-default",
            )}
          >
            <span
              className={cn(
                "text-[9px] font-bold tracking-wide",
                isToday ? "text-brand-accent" : "text-brand-muted",
              )}
            >
              {label}
            </span>
            <span
              className={cn(
                "text-[10px] leading-tight mt-0.5 w-full text-center truncate",
                first ? "text-brand-text font-semibold" : "text-brand-muted",
              )}
            >
              {first ? first.name.replace(/\s*day$/i, "") : "dam"}
            </span>
            {items.length > 1 && (
              <span className="text-[9px] text-brand-muted">+{items.length - 1}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function TemplateBar({ templates, loading, onStart, onManage, onAdoptPresets }) {
  const showPresets = !loading && templates.length === 0;
  const list = showPresets ? TEMPLATE_PRESETS : templates;
  const today = weekdayIndex(todayISO());
  const hasSchedule = list.some((t) => normalizeTemplateDays(t.days).length > 0);

  const ordered = [...list].sort(
    (a, b) =>
      Number(normalizeTemplateDays(b.days).includes(today)) -
      Number(normalizeTemplateDays(a.days).includes(today)),
  );

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
        <>
          {hasSchedule && <WeekStrip list={list} today={today} onStart={onStart} />}

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {ordered.map((t) => (
              <TemplateChip
                key={t.id ?? t.key}
                template={t}
                isToday={normalizeTemplateDays(t.days).includes(today)}
                badge={showPresets ? "namuna" : null}
                onStart={onStart}
              />
            ))}
          </div>

          {!hasSchedule && !showPresets && (
            <button
              type="button"
              onClick={onManage}
              className="text-[11px] text-brand-muted bg-transparent border-none cursor-pointer p-0 mt-1 hover:text-brand-text"
            >
              Haftalik jadval uchun mashqlarga kun belgilang (DUSH, SESH ...) →
            </button>
          )}
        </>
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
