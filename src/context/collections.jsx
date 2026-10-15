import { createCollectionContext } from "./createCollectionContext.jsx";
import { COLLECTIONS } from "../services/paths.js";
import { deleteWorkout, saveWorkout, subscribeWorkouts } from "../services/workoutService.js";
import { deleteExercise, saveExercise, subscribeExercises } from "../services/exerciseService.js";
import {
  deleteMeasurement,
  saveMeasurement,
  subscribeMeasurements,
} from "../services/measurementService.js";
import { deleteTemplate, saveTemplate, subscribeTemplates } from "../services/templateService.js";
import { subscribeAchievements, unlockAchievement } from "../services/achievementService.js";
import {
  deleteProgressPhoto,
  subscribePhotos,
  uploadProgressPhoto,
} from "../services/photoService.js";

const workouts = createCollectionContext({
  name: COLLECTIONS.workouts,
  subscribe: subscribeWorkouts,
  save: saveWorkout,
  remove: deleteWorkout,
});

const exercises = createCollectionContext({
  name: COLLECTIONS.exercises,
  subscribe: subscribeExercises,
  save: saveExercise,
  remove: deleteExercise,
});

const measurements = createCollectionContext({
  name: COLLECTIONS.measurements,
  subscribe: subscribeMeasurements,
  save: saveMeasurement,
  remove: deleteMeasurement,
});

const templates = createCollectionContext({
  name: COLLECTIONS.templates,
  subscribe: subscribeTemplates,
  save: saveTemplate,
  remove: deleteTemplate,
});

const achievements = createCollectionContext({
  name: COLLECTIONS.achievements,
  subscribe: subscribeAchievements,
  save: (uid, item) => unlockAchievement(uid, item),
  remove: () => Promise.resolve(),
});

const photos = createCollectionContext({
  name: COLLECTIONS.photos,
  subscribe: subscribePhotos,
  save: (uid, { file, ...meta }) => uploadProgressPhoto(uid, file, meta),
  remove: deleteProgressPhoto,
  saveError: "Surat yuklanmadi. Internetni tekshirib, qayta urinib ko'ring.",
  removeError: "Suratni o'chirib bo'lmadi. Qayta urinib ko'ring.",
});

export const WorkoutsProvider = workouts.Provider;
export const useWorkouts = workouts.useStore;

export const ExercisesProvider = exercises.Provider;
export const useExercises = exercises.useStore;

export const MeasurementsProvider = measurements.Provider;
export const useMeasurements = measurements.useStore;

export const TemplatesProvider = templates.Provider;
export const useTemplates = templates.useStore;

export const AchievementsProvider = achievements.Provider;
export const useAchievements = achievements.useStore;

export const PhotosProvider = photos.Provider;
export const usePhotos = photos.useStore;
