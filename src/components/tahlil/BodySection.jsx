import React from "react";
import MeasurementForm from "./MeasurementForm.jsx";
import MeasurementChart from "./MeasurementChart.jsx";
import MeasurementHistory from "./MeasurementHistory.jsx";
import PhotoSection from "./PhotoSection.jsx";

export default function BodySection({ form, measurements, photos, onPhotoUploaded }) {
  return (
    <div>
      <MeasurementForm
        date={form.date}
        values={form.values}
        onDateChange={form.setDate}
        onValueChange={form.setValue}
        error={form.error}
        onSubmit={form.submit}
      />

      <MeasurementChart
        fields={measurements.fields}
        selectedField={measurements.selectedField}
        onSelectField={measurements.setSelectedField}
        period={measurements.period}
        onPeriodChange={measurements.setPeriod}
        data={measurements.chartData}
      />

      <PhotoSection photos={photos} onUploaded={onPhotoUploaded} />

      <MeasurementHistory items={measurements.history} onDelete={measurements.deleteMeasurement} />
    </div>
  );
}
