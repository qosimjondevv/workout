import React from "react";
import { AuthProvider } from "./AuthContext.jsx";
import { SyncProvider } from "./SyncContext.jsx";
import { ProfileProvider } from "./ProfileContext.jsx";
import { RestTimerProvider } from "./RestTimerContext.jsx";
import { WorkoutFormProvider } from "./WorkoutFormContext.jsx";
import { ToastProvider } from "../ui/toast.jsx";
import {
  AchievementsProvider,
  ExercisesProvider,
  MeasurementsProvider,
  PhotosProvider,
  TemplatesProvider,
  WorkoutsProvider,
} from "./collections.jsx";

// Provider tartibi MUHIM: pastdagilar yuqoridagilarga tayanadi.
//   Auth  -> kim kirgan
//   Sync  -> saqlash holati va xato
//   qolganlari -> ikkalasini ham ishlatadi
//   WorkoutForm -> mashg'ulotlar va katalogga tayanadi, shuning uchun OXIRIDA
const DATA_PROVIDERS = [
  ProfileProvider,
  RestTimerProvider,
  WorkoutsProvider,
  ExercisesProvider,
  MeasurementsProvider,
  TemplatesProvider,
  AchievementsProvider,
  PhotosProvider,
  WorkoutFormProvider,
];

// Faqat tizimga kirgandan va migratsiyadan keyin o'ralishi kerak bo'lgan qism.
export function DataProviders({ children }) {
  return DATA_PROVIDERS.reduceRight(
    (acc, Provider) => <Provider>{acc}</Provider>,
    children,
  );
}

export function RootProviders({ children }) {
  return (
    <AuthProvider>
      <SyncProvider>
        <ToastProvider>{children}</ToastProvider>
      </SyncProvider>
    </AuthProvider>
  );
}
