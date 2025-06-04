import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { Project, Task, Resource, Risk, BudgetCategory } from '../types/projectTypes';
import { sampleProject } from '../data/sampleProject';
import { UndoRedoManager, UndoItem } from '../services/undoRedoManager';
import { saveProject, openProject } from '../services/fileSystem';
import { createSnapshot, createCrashRecoverySnapshot } from '../services/snapshotManager';

type ProjectState = 'UNINITIALIZED' | 'UNTITLED' | 'EDITING' | 'DIRTY' | 'SAVED' | 'CLOSING';

interface ProjectContextType {
  currentProject: Project | null;
  projects: Project[];
  currentState: ProjectState;
  currentFilePath: string | null;
  setCurrentProject: (project: Project) => void;
  createProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  addResource: (resource: Resource) => void;
  updateResource: (resource: Resource) => void;
  deleteResource: (resourceId: string) => void;
  addBudgetCategory: (category: BudgetCategory) => void;
  updateBudgetCategory: (category: BudgetCategory) => void;
  deleteBudgetCategory: (categoryId: string) => void;
  addRisk: (risk: Risk) => void;
  updateRisk: (risk: Risk) => void;
  deleteRisk: (riskId: string) => void;
  
  // 檔案操作
  saveCurrentProject: () => Promise<string>;
  saveProjectAs: () => Promise<string>;
  openProjectFile: () => Promise<void>;
  createNewProject: () => void;
  
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  
  // 專案狀態
  hasUnsavedChanges: boolean;
  isUntitled: boolean;
  closeProject: () => Promise<boolean>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentState, setCurrentState] = useState<ProjectState>('UNINITIALIZED');
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isUntitled, setIsUntitled] = useState<boolean>(true);
  
  // 自動備份計時器
  const autoSaveTimerRef = useRef<number | null>(null);
  
  // Undo/Redo 管理器
  const undoRedoManager = useRef(new UndoRedoManager(50));
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  
  // 監聽狀態變化
  useEffect(() => {
    setCanUndo(undoRedoManager.current.hasUndoActions());
    setCanRedo(undoRedoManager.current.hasRedoActions());
    
    // 設定自動備份
    if (currentProject && hasUnsavedChanges) {
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
      
      autoSaveTimerRef.current = window.setTimeout(async () => {
        try {
          if (currentProject) {
            await createSnapshot(currentProject, 'Auto');
            console.log('Auto snapshot created');
          }
        } catch (error) {
          console.error('Failed to create auto snapshot:', error);
        }
      }, 10 * 60 * 1000); // 10分鐘
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [currentProject, hasUnsavedChanges]);

  // 設定離開前的確認對話框
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        
        // 建立崩潰恢復快照
        if (currentProject) {
          createCrashRecoverySnapshot(currentProject);
        }
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentProject, hasUnsavedChanges]);

  // 狀態機轉換
  const transition = (action: 'edit' | 'save' | 'saveAs' | 'new' | 'open' | 'close') => {
    switch (action) {
      case 'edit':
        if (currentState === 'SAVED') {
          setCurrentState('EDITING');
          setHasUnsavedChanges(true);
        } else if (currentState === 'EDITING') {
          setCurrentState('DIRTY');
          setHasUnsavedChanges(true);
        }
        break;
      case 'save':
        setCurrentState('SAVED');
        setHasUnsavedChanges(false);
        break;
      case 'saveAs':
        setCurrentState('SAVED');
        setHasUnsavedChanges(false);
        setIsUntitled(false);
        break;
      case 'new':
        setCurrentState('UNTITLED');
        setHasUnsavedChanges(false);
        setIsUntitled(true);
        setCurrentFilePath(null);
        undoRedoManager.current.clearUndoStack();
        break;
      case 'open':
        setCurrentState('SAVED');
        setHasUnsavedChanges(false);
        setIsUntitled(false);
        undoRedoManager.current.clearUndoStack();
        break;
      case 'close':
        setCurrentState('CLOSING');
        break;
    }
  };

  // 檔案操作函數
  const saveCurrentProject = async (): Promise<string> => {
    if (!currentProject) return '';
    
    try {
      const path = await saveProject(currentProject, currentFilePath || undefined);
      if (path) {
        setCurrentFilePath(path);
        setIsUntitled(false);
        transition('save');
        
        // 建立手動快照
        await createSnapshot(currentProject, 'Manual');
      }
      return path;
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error;
    }
  };
  
  const saveProjectAs = async (): Promise<string> => {
    if (!currentProject) return '';
    
    try {
      const path = await saveProject(currentProject);
      if (path) {
        setCurrentFilePath(path);
        setIsUntitled(false);
        transition('saveAs');
        
        // 建立手動快照
        await createSnapshot(currentProject, 'Manual');
      }
      return path;
    } catch (error) {
      console.error('Failed to save project as:', error);
      throw error;
    }
  };
  
  const openProjectFile = async (): Promise<void> => {
    try {
      const project = await openProject();
      if (project) {
        setCurrentProject(project);
        setProjects(prev => [...prev.filter(p => p.id !== project.id), project]);
        setCurrentFilePath(project.id);
        setIsUntitled(false);
        transition('open');
      }
    } catch (error) {
      console.error('Failed to open project:', error);
      throw error;
    }
  };
  
  const createNewProject = () => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: 'Untitled Project',
      description: '',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天後
      status: 'planning',
      progress: 0,
      tasks: [],
      resources: [],
      milestones: [],
      teams: [],
      budget: {
        total: 0,
        spent: 0,
        remaining: 0,
        currency: 'USD',
        categories: []
      },
      risks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setCurrentProject(newProject);
    setProjects(prev => [...prev, newProject]);
    transition('new');
  };
  
  const closeProject = async (): Promise<boolean> => {
    transition('close');
    
    if (hasUnsavedChanges) {
      // 在實際實現中，這裡需要與用戶確認
      // 為簡化，這裡假設用戶選擇儲存
      try {
        if (isUntitled) {
          await saveProjectAs();
        } else {
          await saveCurrentProject();
        }
        return true;
      } catch (error) {
        console.error('Failed to save project before closing:', error);
        return false;
      }
    }
    
    return true;
  };

  // Undo/Redo 操作
  const undo = () => {
    const undoItem = undoRedoManager.current.undo();
    if (!undoItem || !currentProject) return;
    
    handleUndoRedo(undoItem, 'undo');
  };
  
  const redo = () => {
    const redoItem = undoRedoManager.current.redo();
    if (!redoItem || !currentProject) return;
    
    handleUndoRedo(redoItem, 'redo');
  };
  
  const handleUndoRedo = (item: UndoItem, action: 'undo' | 'redo') => {
    if (!currentProject) return;
    
    const state = action === 'undo' ? item.beforeState : item.afterState;
    
    switch (item.type) {
      case 'edit-task':
        updateTaskWithoutUndo(state);
        break;
      case 'delete-task':
        if (action === 'undo') {
          // 恢復已刪除的任務
          const updatedTasks = [...currentProject.tasks, state];
          setCurrentProject({
            ...currentProject,
            tasks: updatedTasks
          });
        } else {
          // 再次刪除任務
          const updatedTasks = currentProject.tasks.filter(t => t.id !== state.id);
          setCurrentProject({
            ...currentProject,
            tasks: updatedTasks
          });
        }
        break;
      case 'create-task':
        if (action === 'undo') {
          // 刪除新建的任務
          const updatedTasks = currentProject.tasks.filter(t => t.id !== state.id);
          setCurrentProject({
            ...currentProject,
            tasks: updatedTasks
          });
        } else {
          // 恢復新建的任務
          const updatedTasks = [...currentProject.tasks, state];
          setCurrentProject({
            ...currentProject,
            tasks: updatedTasks
          });
        }
        break;
      case 'assign-resource':
        updateTaskWithoutUndo(state);
        break;
    }
    
    setCanUndo(undoRedoManager.current.hasUndoActions());
    setCanRedo(undoRedoManager.current.hasRedoActions());
  };
  
  // 不記錄 Undo 的任務更新
  const updateTaskWithoutUndo = (updatedTask: Task) => {
    if (!currentProject) return;
    
    const updatedTasks = currentProject.tasks.map(t => 
      t.id === updatedTask.id ? updatedTask : t
    );
    
    setCurrentProject({
      ...currentProject,
      tasks: updatedTasks
    });
  };

  // 原始 CRUD 操作，包含 Undo 記錄
  const createProject = (project: Project) => {
    setProjects([...projects, project]);
    setCurrentProject(project);
    transition('new');
  };

  const updateProject = (updatedProject: Project) => {
    transition('edit');
    
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    if (currentProject?.id === updatedProject.id) {
      setCurrentProject(updatedProject);
    }
  };

  const deleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    if (currentProject?.id === projectId) {
      setCurrentProject(projects.length > 1 ? projects.find(p => p.id !== projectId) || null : null);
    }
  };

  const addTask = (task: Task) => {
    if (!currentProject) return;
    
    transition('edit');
    
    const updatedProject = {
      ...currentProject,
      tasks: [...currentProject.tasks, task]
    };
    
    // 記錄 Undo 操作
    undoRedoManager.current.pushUndo({
      type: 'create-task',
      targetId: task.id,
      beforeState: null,
      afterState: task
    });
    
    setCanUndo(true);
    updateProject(updatedProject);
  };

  const updateTask = (updatedTask: Task) => {
    if (!currentProject) return;
    
    transition('edit');
    
    // 找到原始任務以記錄 Undo
    const originalTask = currentProject.tasks.find(t => t.id === updatedTask.id);
    
    if (originalTask) {
      undoRedoManager.current.pushUndo({
        type: 'edit-task',
        targetId: updatedTask.id,
        beforeState: { ...originalTask },
        afterState: { ...updatedTask }
      });
    }
    
    const updatedProject = {
      ...currentProject,
      tasks: currentProject.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
    };
    
    setCanUndo(true);
    updateProject(updatedProject);
  };

  const deleteTask = (taskId: string) => {
    if (!currentProject) return;
    
    transition('edit');
    
    // 找到原始任務以記錄 Undo
    const taskToDelete = currentProject.tasks.find(t => t.id === taskId);
    
    if (taskToDelete) {
      undoRedoManager.current.pushUndo({
        type: 'delete-task',
        targetId: taskId,
        beforeState: { ...taskToDelete },
        afterState: null
      });
    }
    
    const updatedProject = {
      ...currentProject,
      tasks: currentProject.tasks.filter(t => t.id !== taskId)
    };
    
    setCanUndo(true);
    updateProject(updatedProject);
  };

  const addResource = (resource: Resource) => {
    if (!currentProject) return;
    
    transition('edit');
    
    const updatedProject = {
      ...currentProject,
      resources: [...currentProject.resources, resource]
    };
    updateProject(updatedProject);
  };

  const updateResource = (updatedResource: Resource) => {
    if (!currentProject) return;
    
    transition('edit');
    
    const updatedProject = {
      ...currentProject,
      resources: currentProject.resources.map(r => r.id === updatedResource.id ? updatedResource : r)
    };
    updateProject(updatedProject);
  };

  const deleteResource = (resourceId: string) => {
    if (!currentProject) return;
    
    transition('edit');
    
    const updatedProject = {
      ...currentProject,
      resources: currentProject.resources.filter(r => r.id !== resourceId)
    };
    updateProject(updatedProject);
  };

  const recalcBudget = (categories: BudgetCategory[]) => {
    const total = categories.reduce((sum, c) => sum + c.planned, 0);
    const spent = categories.reduce((sum, c) => sum + c.actual, 0);
    return {
      total,
      spent,
      remaining: total - spent,
      currency: currentProject?.budget.currency || 'USD',
      categories
    };
  };

  const addBudgetCategory = (category: BudgetCategory) => {
    if (!currentProject) return;

    transition('edit');

    const categories = [...currentProject.budget.categories, category];
    const budget = recalcBudget(categories);
    const updatedProject = {
      ...currentProject,
      budget
    };
    updateProject(updatedProject);
  };

  const updateBudgetCategory = (category: BudgetCategory) => {
    if (!currentProject) return;

    transition('edit');

    const categories = currentProject.budget.categories.map(c => c.id === category.id ? category : c);
    const budget = recalcBudget(categories);
    const updatedProject = {
      ...currentProject,
      budget
    };
    updateProject(updatedProject);
  };

  const deleteBudgetCategory = (categoryId: string) => {
    if (!currentProject) return;

    transition('edit');

    const categories = currentProject.budget.categories.filter(c => c.id !== categoryId);
    const budget = recalcBudget(categories);
    const updatedProject = {
      ...currentProject,
      budget
    };
    updateProject(updatedProject);
  };

  const addRisk = (risk: Risk) => {
    if (!currentProject) return;

    transition('edit');

    const updatedProject = {
      ...currentProject,
      risks: [...currentProject.risks, risk]
    };
    updateProject(updatedProject);
  };

  const updateRisk = (updatedRisk: Risk) => {
    if (!currentProject) return;

    transition('edit');

    const updatedProject = {
      ...currentProject,
      risks: currentProject.risks.map(r => r.id === updatedRisk.id ? updatedRisk : r)
    };
    updateProject(updatedProject);
  };

  const deleteRisk = (riskId: string) => {
    if (!currentProject) return;

    transition('edit');

    const updatedProject = {
      ...currentProject,
      risks: currentProject.risks.filter(r => r.id !== riskId)
    };
    updateProject(updatedProject);
  };

  return (
    <ProjectContext.Provider value={{
      currentProject,
      projects,
      currentState,
      currentFilePath,
      hasUnsavedChanges,
      isUntitled,
      canUndo,
      canRedo,
      setCurrentProject,
      createProject,
      updateProject,
      deleteProject,
      addTask,
      updateTask,
      deleteTask,
      addResource,
      updateResource,
      deleteResource,
      addBudgetCategory,
      updateBudgetCategory,
      deleteBudgetCategory,
      addRisk,
      updateRisk,
      deleteRisk,
      saveCurrentProject,
      saveProjectAs,
      openProjectFile,
      createNewProject,
      closeProject,
      undo,
      redo
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};