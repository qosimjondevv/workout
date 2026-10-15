import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkouts } from "../context/collections.jsx";
import { useWorkoutFormContext } from "../context/WorkoutFormContext.jsx";
import { useWorkoutHistory } from "../hooks/useWorkoutHistory.js";
import HistoryList from "../components/jurnal/HistoryList.jsx";
import { ConfirmDialog } from "../ui/dialog.jsx";

export default function TarixPage() {
  const navigate = useNavigate();
  const wf = useWorkoutFormContext();
  const { remove } = useWorkouts();
  const { historyFilter, setHistoryFilter, filteredHistory, loading } = useWorkoutHistory();
  const [pendingEdit, setPendingEdit] = useState(null);

  function openInForm(workout) {
    wf.loadIntoForm(workout);
    navigate("/jurnal");
    window.scrollTo({ top: 0 });
  }

  function handleEdit(workout) {
    if (wf.isDirty && wf.form.id !== workout.id) {
      setPendingEdit(workout);
      return;
    }
    openInForm(workout);
  }

  function handleDelete(id) {
    if (wf.form.id === id) wf.resetForm();
    remove(id);
  }

  return (
    <>
      <HistoryList
        historyFilter={historyFilter}
        onFilterChange={setHistoryFilter}
        items={filteredHistory}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ConfirmDialog
        open={Boolean(pendingEdit)}
        title="Joriy forma almashtiriladi"
        message="Jurnalda saqlanmagan mashg'ulot bor. Uni o'chirib, shu yozuvni tahrirlashga ochaymi?"
        confirmLabel="Ha, ochish"
        onConfirm={() => {
          const w = pendingEdit;
          setPendingEdit(null);
          openInForm(w);
        }}
        onCancel={() => setPendingEdit(null)}
      />
    </>
  );
}
