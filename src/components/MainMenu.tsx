import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { readTextFile, exists } from '@tauri-apps/api/fs';
import { appLocalDataDir } from '@tauri-apps/api/path';
import { Briefcase, FileText, Plus, FolderOpen, BookOpen } from 'lucide-react';
import { checkCrashRecoveryFiles } from '../services/fileSystem';
import { loadSnapshot } from '../services/snapshotManager';
import { confirm } from '@tauri-apps/api/dialog';

interface RecentProject {
  fileName: string;
  filePath: string;
  openedAt: string;
  projectUUID: string;
  isTemporary: boolean;
}

const MainMenu: React.FC = () => {
  const { createNewProject, openProjectFile, setCurrentProject } = useProject();
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  // 讀取最近專案與復原檔所需的狀態
  // 不特別顯示載入指示，仍保留錯誤處理流程
  const [recoveryFilePath, setRecoveryFilePath] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const appDataDir = await appLocalDataDir();
        const recentProjectsPath = `${appDataDir}recent_projects.json`;
        
        try {
          if (await exists(recentProjectsPath)) {
            const content = await readTextFile(recentProjectsPath);
            const projects = JSON.parse(content);
            setRecentProjects(projects);
          } else {
            setRecentProjects([]);
          }
        } catch {
          // 檔案不存在或格式錯誤
          setRecentProjects([]);
        }
        
        // 檢查是否有復原檔案
        const recoveryPath = await checkCrashRecoveryFiles();
        setRecoveryFilePath(recoveryPath);
        
        // 不顯示額外的載入指示
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    
    loadData();
  }, []);
  
  const handleNewProject = () => {
    createNewProject();
  };
  
  const handleOpenProject = () => {
    openProjectFile();
  };
  
  const handleOpenRecentProject = async (filePath: string) => {
    try {
      await openProjectFile(filePath);
    } catch (error) {
      console.error('Failed to open recent project:', error);
      const confirmed = await confirm('無法開啟檔案，是否從最近開啟列表中移除？', {
        title: '開啟錯誤',
        type: 'error'
      });
      
      if (confirmed) {
        // 實際實現中應移除該檔案
        setRecentProjects(prev => prev.filter(p => p.filePath !== filePath));
      }
    }
  };
  
  const handleRecoveryFile = async () => {
    if (!recoveryFilePath) return;
    
    try {
      const project = await loadSnapshot(recoveryFilePath);
      if (project) {
        setCurrentProject(project);
      }
    } catch (error) {
      console.error('Failed to recover project:', error);
      setRecoveryFilePath(null);
    }
  };
  
  const handleCreateFromTemplate = () => {
    // 實際實現中應載入特定範本
    createNewProject();
  };
  
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="relative bg-[url('https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center p-10 text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-indigo-900/80 backdrop-blur-[1px]"></div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-6">
              <div className="rounded-lg bg-gradient-to-tr from-pink-500 to-purple-600 p-3 mr-3">
                <Briefcase size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">ProjectCraft</h1>
                <p className="text-purple-200">專業離線專案管理工具</p>
              </div>
            </div>
            
            {recoveryFilePath && (
              <div className="bg-amber-500/20 backdrop-blur-sm border border-amber-300/30 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-amber-100 mb-2">發現自動備份</h3>
                <p className="text-amber-100/90 text-sm mb-3">系統檢測到一個未正常關閉的專案備份，您可以選擇復原它。</p>
                <div className="flex space-x-3">
                  <button 
                    onClick={handleRecoveryFile}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
                  >
                    復原備份
                  </button>
                  <button 
                    onClick={() => setRecoveryFilePath(null)}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                  >
                    忽略
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <button 
              onClick={handleNewProject}
              className="flex items-center p-6 border-2 border-slate-200 rounded-xl hover:border-purple-300 transition-colors bg-gradient-to-br from-white to-slate-50 group"
            >
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors">
                <Plus size={24} className="text-purple-600" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-slate-800 mb-1">新建專案</h2>
                <p className="text-slate-500 text-sm">建立一個全新的空白專案</p>
              </div>
            </button>
            
            <button 
              onClick={handleOpenProject}
              className="flex items-center p-6 border-2 border-slate-200 rounded-xl hover:border-purple-300 transition-colors bg-gradient-to-br from-white to-slate-50 group"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4 group-hover:bg-indigo-200 transition-colors">
                <FolderOpen size={24} className="text-indigo-600" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-slate-800 mb-1">開啟專案</h2>
                <p className="text-slate-500 text-sm">開啟已儲存的專案檔案</p>
              </div>
            </button>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">專案範本</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: '產品開發', key: 'product' }, 
                { name: '網站建置', key: 'website' }, 
                { name: '活動計劃', key: 'event' }
              ].map(template => (
                <button 
                  key={template.key}
                  onClick={handleCreateFromTemplate}
                  className="p-4 border border-slate-200 rounded-lg hover:border-purple-300 transition-colors flex items-center"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mr-3">
                    <BookOpen size={20} className="text-indigo-600" />
                  </div>
                  <span className="text-slate-700">{template.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {recentProjects.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4">最近開啟</h2>
              <div className="space-y-2">
                {recentProjects.slice(0, 5).map(project => (
                  <button 
                    key={project.projectUUID}
                    onClick={() => handleOpenRecentProject(project.filePath)}
                    className="flex items-center w-full p-3 border border-slate-200 rounded-lg hover:border-purple-300 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3">
                      <FileText size={16} className="text-slate-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-slate-800 truncate">{project.fileName}</h3>
                      <p className="text-xs text-slate-500 truncate">{project.filePath}</p>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(project.openedAt).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainMenu;