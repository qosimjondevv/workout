import React from "react";
import VolumeChart from "./VolumeChart.jsx";
import ExerciseChart from "./ExerciseChart.jsx";
import BodyWeightChart from "./BodyWeightChart.jsx";
import MuscleDistribution from "./MuscleDistribution.jsx";

// Bu bo'lim LAZY yuklanadi: recharts og'ir (105 kB gzip) va faqat statistika
// ko'rmoqchi bo'lgan odam uni umuman yuklab olmasligi kerak.
export default function ChartsSection({ analytics, dashboard }) {
  return (
    <div>
      <VolumeChart
        data={dashboard.volumeData}
        period={dashboard.volumePeriod}
        onPeriodChange={dashboard.setVolumePeriod}
      />

      <ExerciseChart
        exerciseNames={analytics.allExerciseNames}
        selectedExercise={analytics.selectedExercise}
        onSelectExercise={analytics.setSelectedExercise}
        unit={analytics.selectedExerciseUnit}
        data={analytics.exerciseChartData}
      />

      <BodyWeightChart data={analytics.bodyWeightData} />

      <MuscleDistribution data={dashboard.distribution} />
    </div>
  );
}
