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

export function DataProviders({ children }) {
  return DATA_PROVIDERS.reduceRight((acc, Provider) => <Provider>{acc}</Provider>, children);
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
