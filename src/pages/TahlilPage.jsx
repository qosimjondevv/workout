import React, { Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutGrid, LineChart, Ruler } from "lucide-react";
import { useAnalytics } from "../hooks/useAnalytics.js";
import { useDashboard } from "../hooks/useDashboard.js";
import { useWorkoutCalendar } from "../hooks/useWorkoutCalendar.js";
import { useMeasurementForm } from "../hooks/useMeasurementForm.js";
import { useMeasurementAnalytics } from "../hooks/useMeasurementAnalytics.js";
import { useProgressPhotos } from "../hooks/useProgressPhotos.js";
import { useToast } from "../ui/toast.jsx";
import StatsSection from "../components/tahlil/StatsSection.jsx";
import { SegmentedControl } from "../ui/segmented.jsx";
import { SkeletonList } from "../ui/skeleton.jsx";

// Grafikli bo'limlar LAZY: recharts 105 kB (gzip) va faqat statistikani
// ko'rmoqchi bo'lgan odam uni yuklab olishi shart emas.
const ChartsSection = lazy(
  () => import("../components/tahlil/ChartsSection.jsx"),
);
const BodySection = lazy(() => import("../components/tahlil/BodySection.jsx"));

const TABS = [
  { value: "statistika", label: "Statistika", icon: LayoutGrid },
  { value: "grafiklar", label: "Grafiklar", icon: LineChart },
  { value: "tana", label: "Tana", icon: Ruler },
];

export default function TahlilPage() {
  // Bo'lim manzilda saqlanadi: sahifani yangilasangiz ham o'sha joyda qolasiz.
  // replace: true — ichki bo'lim almashtirish brauzer tarixini to'ldirmaydi,
  // ya'ni "orqaga" tugmasi Tahlil sahifasidan butunlay chiqaradi.
  const [params, setParams] = useSearchParams();
  const requested = params.get("bolim");
  const tab = TABS.some((t) => t.value === requested)
    ? requested
    : TABS[0].value;

  const analytics = useAnalytics();
  const dashboard = useDashboard();
  const calendar = useWorkoutCalendar();
  const measurementForm = useMeasurementForm();
  const measurements = useMeasurementAnalytics();
  const photos = useProgressPhotos();
  const toast = useToast();

  if (analytics.loading) return <SkeletonList count={5} />;

  return (
    <div>
      <div className="sticky top-0 z-20 -mx-4 px-4 pb-3 pt-1 bg-brand-bg">
        <SegmentedControl
          value={tab}
          onChange={(value) => setParams({ bolim: value }, { replace: true })}
          options={TABS}
          size="lg"
        />
      </div>

      {tab === "statistika" && (
        <StatsSection
          stats={analytics.stats}
          prCount={dashboard.prCount}
          calendar={calendar}
        />
      )}

      <Suspense fallback={<SkeletonList count={3} />}>
        {tab === "grafiklar" && (
          <ChartsSection analytics={analytics} dashboard={dashboard} />
        )}

        {tab === "tana" && (
          <BodySection
            form={measurementForm}
            measurements={measurements}
            photos={photos}
            onPhotoUploaded={() => toast.show({ tone: "success", title: "Surat yuklandi" })}
          />
        )}
      </Suspense>
    </div>
  );
}
