import React, { useState } from 'react';
import { Search, Bell, Calendar, Plus, ChevronDown, Expand, Save, FileText, FolderOpen } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { message, confirm } from '@tauri-apps/api/dialog';

interface HeaderProps {
  currentView: string;
}

export const Header: React.FC<HeaderProps> = ({ currentView }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    currentProject, 
    saveCurrentProject, 
    saveProjectAs, 
    openProjectFile,
    createNewProject,
    hasUnsavedChanges,
    isUntitled,
    undo,
    redo,
    canUndo,
    canRedo
  } = useProject();
  
  // 視圖標題映射
  const viewTitles: Record<string, string> = {
    dashboard: '儀表板',
    gantt: '甘特圖',
    tasks: '任務',
    resources: '資源',
    reports: '報告',
    settings: '設定',
  };

  const handleSave = async () => {
    try {
      if (isUntitled) {
        await handleSaveAs();
        return;
      }
      
      await saveCurrentProject();
      await message('專案已成功儲存', { title: '儲存成功' });
    } catch (error) {
      console.error('Failed to save project:', error);
      await message('儲存專案時發生錯誤', { title: '錯誤', type: 'error' });
    }
  };

  const handleSaveAs = async () => {
    try {
      const path = await saveProjectAs();
      if (path) {
        await message('專案已成功另存為新檔', { title: '儲存成功' });
      }
    } catch (error) {
      console.error('Failed to save project as:', error);
      await message('另存專案時發生錯誤', { title: '錯誤', type: 'error' });
    }
  };

  const handleOpen = async () => {
    try {
      if (hasUnsavedChanges) {
        const confirmed = await confirm('目前專案有未儲存的變更，是否繼續？', {
          title: '未儲存變更',
          type: 'warning',
        });
        
        if (!confirmed) return;
        
        const saveConfirmed = await confirm('是否要儲存變更？', {
          title: '儲存變更',
          type: 'info',
        });
        
        if (saveConfirmed) {
          await handleSave();
        }
      }
      
      await openProjectFile();
    } catch (error) {
      console.error('Failed to open project:', error);
      await message('開啟專案時發生錯誤', { title: '錯誤', type: 'error' });
    }
  };

  const handleNew = async () => {
    try {
      if (hasUnsavedChanges) {
        const confirmed = await confirm('目前專案有未儲存的變更，是否繼續？', {
          title: '未儲存變更',
          type: 'warning',
        });
        
        if (!confirmed) return;
        
        const saveConfirmed = await confirm('是否要儲存變更？', {
          title: '儲存變更',
          type: 'info',
        });
        
        if (saveConfirmed) {
          await handleSave();
        }
      }
      
      createNewProject();
    } catch (error) {
      console.error('Failed to create new project:', error);
      await message('建立專案時發生錯誤', { title: '錯誤', type: 'error' });
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 py-3 px-6 flex items-center justify-between bg-gradient-to-r from-white to-slate-50">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-slate-800">{viewTitles[currentView] || '儀表板'}</h1>
        {currentProject && (
          <div className="ml-4 flex items-center">
            <span className="text-slate-400">|</span>
            <span className="ml-4 text-slate-600 font-medium">
              {currentProject.name}
              {hasUnsavedChanges && <span className="text-amber-500 ml-1">*</span>}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-1">
        <div className="flex items-center bg-slate-100 rounded-lg p-1 mr-3">
          <button 
            onClick={handleNew}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors flex items-center"
            title="新建專案"
          >
            <FileText size={18} />
          </button>
          <button 
            onClick={handleOpen}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors flex items-center"
            title="開啟專案"
          >
            <FolderOpen size={18} />
          </button>
          <button 
            onClick={handleSave}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors flex items-center"
            title="儲存專案"
          >
            <Save size={18} />
          </button>
        </div>
        
        <div className="flex items-center bg-slate-100 rounded-lg p-1 mr-3">
          <button 
            onClick={undo}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-colors flex items-center ${
              canUndo ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 cursor-not-allowed'
            }`}
            title="復原"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6"></path>
              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
            </svg>
          </button>
          <button 
            onClick={redo}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-colors flex items-center ${
              canRedo ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 cursor-not-allowed'
            }`}
            title="重做"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 7v6h-6"></path>
              <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"></path>
            </svg>
          </button>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="搜尋..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-64 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
        </div>
        
        <button className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>
        
        <button className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
          <Calendar size={20} />
        </button>
        
        <button className="ml-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm">
          <Plus size={16} className="mr-1.5" />
          <span>新建</span>
        </button>
        
        <div className="h-6 border-r border-slate-200 mx-2"></div>
        
        <button className="flex items-center text-slate-700">
          <div className="w-8 h-8 rounded-full overflow-hidden mr-2 bg-indigo-100">
            <img 
              src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100" 
              alt="User avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-medium text-sm mr-1">Alex Chen</span>
          <ChevronDown size={14} />
        </button>
        
        <button className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
          <Expand size={20} />
        </button>
      </div>
    </header>
  );
};