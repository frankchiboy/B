import React, { useState, Suspense, lazy, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { Sidebar } from './components/navigation/Sidebar';
import { Header } from './components/navigation/Header';
import { createCrashRecoverySnapshot } from './services/snapshotManager';

const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const GanttView = lazy(() => import('./pages/GanttView').then(module => ({ default: module.GanttView })));
const TasksView = lazy(() => import('./pages/TasksView').then(module => ({ default: module.TasksView })));
const ResourcesView = lazy(() => import('./pages/ResourcesView').then(module => ({ default: module.ResourcesView })));
const ReportsView = lazy(() => import('./pages/ReportsView'));
const RisksView = lazy(() => import('./pages/RisksView'));
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const WelcomeOverlay = lazy(() => import('./components/overlays/WelcomeOverlay'));
const MainMenu = lazy(() => import('./components/MainMenu'));

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showMainMenu, setShowMainMenu] = useState(true);
  const { currentProject, hasUnsavedChanges } = useProject();

  useEffect(() => {
    // 當有當前專案時，隱藏主選單
    if (currentProject) {
      setShowMainMenu(false);
    }
    
    // 設定離開前的確認對話框
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && currentProject) {
        e.preventDefault();
        e.returnValue = '';
        
        // 建立崩潰恢復快照
        createCrashRecoverySnapshot(currentProject);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentProject, hasUnsavedChanges]);

  // 設定自動儲存
  useEffect(() => {
    let autoSaveInterval: number | null = null;
    
    if (currentProject && hasUnsavedChanges) {
      autoSaveInterval = window.setInterval(() => {
        if (currentProject) {
          createCrashRecoverySnapshot(currentProject);
        }
      }, 10 * 60 * 1000); // 10分鐘
    }
    
    return () => {
      if (autoSaveInterval) {
        window.clearInterval(autoSaveInterval);
      }
    };
  }, [currentProject, hasUnsavedChanges]);

  const renderView = () => {
    if (showMainMenu) {
      return <MainMenu />;
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'gantt':
        return <GanttView />;
      case 'tasks':
        return <TasksView />;
      case 'resources':
        return <ResourcesView />;
      case 'risks':
        return <RisksView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (showMainMenu) {
    return (
      <Suspense fallback={<div className="flex items-center justify-center h-screen text-slate-500">載入中...</div>}>
        <MainMenu />
      </Suspense>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="fixed inset-0 bg-[url('https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-overlay from-brand-purple-900/95 via-brand-indigo-900/95 to-brand-purple-900/95 backdrop-blur-md"></div>
      </div>
      <div className="relative z-10 flex w-full">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header currentView={currentView} />
          <main className="flex-1 overflow-auto p-0 relative">
            <Suspense fallback={<div className="p-4 text-slate-500">載入中...</div>}>
              {renderView()}
            </Suspense>
          </main>
        </div>
        {showWelcome && !showMainMenu && (
          <Suspense fallback={<div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center text-white">載入中...</div>}>
            <WelcomeOverlay onClose={() => setShowWelcome(false)} />
          </Suspense>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ProjectProvider>
        <AppContent />
      </ProjectProvider>
    </ThemeProvider>
  );
}

export default App;