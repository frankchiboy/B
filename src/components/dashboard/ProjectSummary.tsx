import React from 'react';
import { Clock, CalendarDays, Users, DollarSign, AlertTriangle } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const ProjectSummary: React.FC = () => {
  const { currentProject } = useProject();
  
  if (!currentProject) return null;
  
  // Calculate days remaining
  const today = new Date();
  const endDate = new Date(currentProject.endDate);
  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate budget percentage
  const budgetPercentage = Math.round((currentProject.budget.spent / currentProject.budget.total) * 100);
  
  // Calculate task statuses
  const totalTasks = currentProject.tasks.length;
  const completedTasks = currentProject.tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = currentProject.tasks.filter(task => task.status === 'in-progress').length;
  const notStartedTasks = currentProject.tasks.filter(task => task.status === 'not-started').length;
  const delayedTasks = currentProject.tasks.filter(task => task.status === 'delayed').length;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currentProject.budget.currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 relative z-10">
      <div className="col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="relative bg-[url('https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center p-6 text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/60 to-indigo-600/60 backdrop-blur-[1px]"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">{currentProject.name}</h2>
            <p className="text-indigo-100 mb-6">{currentProject.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mr-3">
                  <Clock size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-indigo-100">天數剩餘</p>
                  <p className="text-xl font-semibold">{daysRemaining} 天</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mr-3">
                  <CalendarDays size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-indigo-100">專案進度</p>
                  <p className="text-xl font-semibold">{currentProject.progress}%</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mr-3">
                  <Users size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-indigo-100">團隊成員</p>
                  <p className="text-xl font-semibold">{currentProject.resources.length}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mr-3">
                  <DollarSign size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-indigo-100">預算使用</p>
                  <p className="text-xl font-semibold">{budgetPercentage}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <h3 className="font-medium text-slate-800">整體進度</h3>
              <span className="text-sm font-medium text-purple-600">{currentProject.progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${currentProject.progress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-slate-800 mb-4">任務狀態</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm text-slate-600">已完成</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-slate-800 mr-2">{completedTasks}</span>
                    <span className="text-xs text-slate-500">({Math.round((completedTasks / totalTasks) * 100)}%)</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                    <span className="text-sm text-slate-600">進行中</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-slate-800 mr-2">{inProgressTasks}</span>
                    <span className="text-xs text-slate-500">({Math.round((inProgressTasks / totalTasks) * 100)}%)</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-slate-300 mr-2"></div>
                    <span className="text-sm text-slate-600">尚未開始</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-slate-800 mr-2">{notStartedTasks}</span>
                    <span className="text-xs text-slate-500">({Math.round((notStartedTasks / totalTasks) * 100)}%)</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-rose-500 mr-2"></div>
                    <span className="text-sm text-slate-600">已延遲</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-slate-800 mr-2">{delayedTasks}</span>
                    <span className="text-xs text-slate-500">({Math.round((delayedTasks / totalTasks) * 100)}%)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-slate-800 mb-4">預算使用</h3>
              <div className="mb-5">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">已用</span>
                  <span className="font-medium text-slate-800">{formatCurrency(currentProject.budget.spent)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">總預算</span>
                  <span className="font-medium text-slate-800">{formatCurrency(currentProject.budget.total)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      budgetPercentage > 90 ? 'bg-rose-500' : 
                      budgetPercentage > 70 ? 'bg-amber-500' : 
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${budgetPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-slate-500">已使用 {budgetPercentage}%</span>
                  <span className="text-slate-500">剩餘 {formatCurrency(currentProject.budget.remaining)}</span>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                  <AlertTriangle size={16} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-800">開發部門預算即將超支</p>
                  <p className="text-xs text-amber-600">建議審查開支計劃</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-medium text-slate-800 mb-4">即將到來的里程碑</h3>
        
        <div className="space-y-4">
          {currentProject.milestones
            .filter(milestone => milestone.status === 'upcoming')
            .slice(0, 3)
            .map(milestone => (
              <div key={milestone.id} className="p-4 border border-slate-200 rounded-lg hover:border-purple-300 transition-colors bg-gradient-to-r from-white to-slate-50">
                <h4 className="font-medium text-slate-800 mb-1">{milestone.name}</h4>
                <p className="text-sm text-slate-500 mb-3">{milestone.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <CalendarDays size={14} className="text-slate-400 mr-1" />
                    <span className="text-xs text-slate-500">{new Date(milestone.date).toLocaleDateString()}</span>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    即將到來
                  </span>
                </div>
              </div>
            ))}
            
          {currentProject.milestones.filter(milestone => milestone.status === 'upcoming').length === 0 && (
            <div className="p-4 border border-slate-200 rounded-lg text-center">
              <p className="text-sm text-slate-500">沒有即將到來的里程碑</p>
            </div>
          )}
        </div>
        
        <div className="mt-6">
          <h3 className="font-medium text-slate-800 mb-4">專案團隊</h3>
          
          <div className="space-y-3">
            {currentProject.teams.slice(0, 3).map(team => (
              <div key={team.id} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg hover:border-purple-300 transition-colors bg-gradient-to-r from-white to-slate-50">
                <div className="flex items-center">
                  <div className="flex -space-x-2 mr-3">
                    {currentProject.resources
                      .filter(resource => team.members.includes(resource.id))
                      .slice(0, 3)
                      .map(resource => (
                        <div key={resource.id} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                          <img 
                            src={resource.avatar || `https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100`} 
                            alt={resource.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    {team.members.length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                        +{team.members.length - 3}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-slate-800">{team.name}</h4>
                    <p className="text-xs text-slate-500">{team.members.length} 成員</p>
                  </div>
                </div>
                <button className="text-purple-600 text-sm hover:text-purple-800">查看</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};