import React from "react";
import HistoryFilterBar from "./HistoryFilterBar.jsx";
import HistoryItem from "./HistoryItem.jsx";
import { SkeletonList } from "../../ui/skeleton.jsx";

export default function HistoryList({
  historyFilter,
  onFilterChange,
  items,
  loading,
  onEdit,
  onDelete,
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="font-display text-[15px] uppercase text-brand-text">Tarix</div>
        <HistoryFilterBar value={historyFilter} onChange={onFilterChange} />
      </div>

      {loading && <SkeletonList count={3} />}

      {!loading && items.length === 0 && (
        <div className="text-brand-muted text-[13px] text-center py-5">Hali yozuv yo'q.</div>
      )}

      {!loading &&
        items.map((w) => (
          <HistoryItem
            key={w.id}
            workout={w}
            onEdit={() => onEdit(w)}
            onDelete={() => onDelete(w.id)}
          />
        ))}
    </div>
  );
}
