import React from 'react';
import { ProjectSummary } from '../components/dashboard/ProjectSummary';
import { TaskProgress } from '../components/dashboard/TaskProgress';
import { ResourceAllocation } from '../components/dashboard/ResourceAllocation';
import { useProject } from '../context/ProjectContext';
import { Grid3X3, Award, Bell, Calendar } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { currentProject } = useProject();
  
  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <Grid3X3 size={48} className="text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">沒有選擇專案</h2>
          <p className="text-slate-500 mb-4">請選擇或創建一個專案以開始使用</p>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium shadow-sm hover:from-purple-700 hover:to-indigo-700 transition-colors">
            創建新專案
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative p-6">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 to-slate-100/80 backdrop-blur-[1px]"></div>
      </div>
      <div className="relative z-10">
      <ProjectSummary />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <TaskProgress />
        </div>
        
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-slate-100">
            <div className="relative bg-[url('https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center p-5 text-white">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/70 to-indigo-600/70 backdrop-blur-[1px]"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">今日摘要</h2>
                    <p className="text-indigo-100 text-sm">{new Date().toLocaleDateString('zh-TW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="p-2 rounded-full bg-white/20">
                    <Calendar size={20} className="text-white" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-white bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="flex items-center">
                    <Bell size={18} className="mr-2" />
                    <span className="text-sm">今天有 3 個待辦項目</span>
                  </div>
                  <button className="text-xs bg-white/20 px-2 py-1 rounded-md hover:bg-white/30 transition-colors">
                    查看
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="font-medium text-slate-800 mb-3">今日任務</h3>
              
              <div className="space-y-2">
                {currentProject.tasks
                  .filter(task => task.status === 'in-progress')
                  .slice(0, 3)
                  .map(task => (
                    <div key={task.id} className="flex items-center p-3 border border-slate-200 rounded-lg bg-gradient-to-r from-white to-slate-50">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2"></div>
                      <span className="text-sm text-slate-800 truncate">{task.name}</span>
                      <span className="ml-auto text-xs text-slate-500">{task.progress}%</span>
                    </div>
                  ))}
                
                {currentProject.tasks.filter(task => task.status === 'in-progress').length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-slate-500">沒有進行中的任務</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
            <div className="p-5 border-b border-slate-200">
              <div className="flex items-center mb-1">
                <Award size={18} className="text-amber-500 mr-2" />
                <h2 className="text-lg font-semibold text-slate-800">績效指標</h2>
              </div>
              <p className="text-slate-500 text-sm">專案關鍵績效指標</p>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-slate-600">任務完成率</span>
                  <span className="text-sm font-medium text-slate-800">
                    {Math.round((currentProject.tasks.filter(t => t.status === 'completed').length / currentProject.tasks.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div 
                    className="bg-emerald-500 h-1.5 rounded-full" 
                    style={{ width: `${Math.round((currentProject.tasks.filter(t => t.status === 'completed').length / currentProject.tasks.length) * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-slate-600">里程碑達成率</span>
                  <span className="text-sm font-medium text-slate-800">
                    {Math.round((currentProject.milestones.filter(m => m.status === 'reached').length / currentProject.milestones.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full" 
                    style={{ width: `${Math.round((currentProject.milestones.filter(m => m.status === 'reached').length / currentProject.milestones.length) * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-slate-600">團隊產能</span>
                  <span className="text-sm font-medium text-slate-800">{averageUtilization}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full" 
                    style={{ width: `${averageUtilization}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
        <ResourceAllocation />
      </div>
    </div>
  );
};

const averageUtilization = 75; // 這應該從 ResourceAllocation 組件獲取，這裡只是示例值