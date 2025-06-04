import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const TaskProgress: React.FC = () => {
  const { currentProject } = useProject();

  if (!currentProject) {
    return null;
  }

  const tasks = currentProject.tasks;
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const pendingTasks = tasks.filter(task => task.status === 'pending');

  const calculatePercentage = (count: number) => {
    return tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
      <div className="p-5 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">任務進度追蹤</h2>
        <p className="text-slate-500 text-sm">專案任務完成狀態概覽</p>
      </div>
      
      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <CheckCircle2 className="text-emerald-500 mr-2" size={20} />
            <h3 className="font-medium text-slate-800">已完成任務</h3>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-semibold text-emerald-600">{completedTasks.length}</p>
              <p className="text-sm text-emerald-600/80">{calculatePercentage(completedTasks.length)}% 的總任務</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-sm font-medium text-emerald-600">{completedTasks.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Clock className="text-amber-500 mr-2" size={20} />
            <h3 className="font-medium text-slate-800">進行中任務</h3>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-semibold text-amber-600">{inProgressTasks.length}</p>
              <p className="text-sm text-amber-600/80">{calculatePercentage(inProgressTasks.length)}% 的總任務</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-sm font-medium text-amber-600">{inProgressTasks.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="text-slate-500 mr-2" size={20} />
            <h3 className="font-medium text-slate-800">待處理任務</h3>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-semibold text-slate-600">{pendingTasks.length}</p>
              <p className="text-sm text-slate-600/80">{calculatePercentage(pendingTasks.length)}% 的總任務</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-sm font-medium text-slate-600">{pendingTasks.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${calculatePercentage(completedTasks.length)}%` }}
          ></div>
        </div>
        <div className="mt-2 flex justify-between text-sm text-slate-600">
          <span>總進度</span>
          <span className="font-medium">{calculatePercentage(completedTasks.length)}%</span>
        </div>
      </div>
    </div>
  );
};