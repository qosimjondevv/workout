import React, { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DataProviders, RootProviders } from "./context/AppProviders.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { useSync } from "./context/SyncContext.jsx";
import { useRestTimerActions, useRestTimerState } from "./context/RestTimerContext.jsx";
import { useAchievementTracker } from "./hooks/useAchievementTracker.js";
import MigrationGate from "./context/MigrationGate.jsx";
import { todayISO, fmt } from "./utils/date.js";
import Header from "./layouts/Header.jsx";
import BottomNav from "./layouts/BottomNav.jsx";
import SaveStatus from "./layouts/SaveStatus.jsx";
import RestTimerBar from "./layouts/RestTimerBar.jsx";
import { BottomDockLayout } from "./layouts/BottomDock.jsx";
import AchievementModal from "./components/achievements/AchievementModal.jsx";
import LoginPage from "./pages/LoginPage.jsx";

const JurnalPage = lazy(() => import("./pages/JurnalPage.jsx"));
const TarixPage = lazy(() => import("./pages/TarixPage.jsx"));
const TahlilPage = lazy(() => import("./pages/TahlilPage.jsx"));
const ProfilPage = lazy(() => import("./pages/ProfilPage.jsx"));

function LoadingScreen({ label = "Yuklanmoqda..." }) {
  return (
    <div className="bg-brand-bg min-h-screen flex items-center justify-center">
      <div className="text-brand-muted font-sans text-sm">{label}</div>
    </div>
  );
}

function PageFallback() {
  return <div className="text-brand-muted text-[13px] text-center py-10">Yuklanmoqda...</div>;
}

function RestTimerDock() {
  const { active, remaining, running } = useRestTimerState();
  const { pause, resume, extend, skip } = useRestTimerActions();

  return (
    <RestTimerBar
      active={active}
      remaining={remaining}
      running={running}
      onPause={pause}
      onResume={resume}
      onExtend={extend}
      onSkip={skip}
    />
  );
}

function Shell() {
  const { syncing, error, retry } = useSync();
  const achievements = useAchievementTracker();

  return (
    <div className="bg-brand-bg min-h-screen font-sans text-brand-text max-w-[480px] mx-auto relative">
      <Header dateLabel={fmt(todayISO())} />

      <BottomDockLayout
        dock={
          <>
            <SaveStatus syncing={syncing} saveError={error} onRetry={retry} />
            <RestTimerDock />
          </>
        }
      >
        {(bottomInset) => (
          <main className="px-4 pt-4" style={{ paddingBottom: bottomInset }}>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/jurnal" element={<JurnalPage />} />
                <Route path="/tarix" element={<TarixPage />} />
                <Route path="/jadval" element={<Navigate to="/tarix" replace />} />
                <Route path="/tahlil" element={<TahlilPage />} />
                <Route path="/profil" element={<ProfilPage />} />
                <Route path="*" element={<Navigate to="/jurnal" replace />} />
              </Routes>
            </Suspense>
          </main>
        )}
      </BottomDockLayout>

      <BottomNav />

      <AchievementModal pending={achievements.pending} onClose={achievements.dismiss} />
    </div>
  );
}

function Gate() {
  const { user, authLoading } = useAuth();

  if (authLoading) return <LoadingScreen />;
  if (!user) return <LoginPage />;

  return (
    <MigrationGate fallback={<LoadingScreen label="Ma'lumot tayyorlanmoqda..." />}>
      <DataProviders>
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
      </DataProviders>
    </MigrationGate>
  );
}

export default function App() {
  return (
    <RootProviders>
      <Gate />
    </RootProviders>
  );
}
