import React from 'react';
import { Users, BarChart, ArrowRight } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const ResourceAllocation: React.FC = () => {
  const { currentProject } = useProject();
  
  if (!currentProject) return null;
  
  // 計算資源利用率統計
  const averageUtilization = currentProject.resources.length > 0
    ? Math.round(currentProject.resources.reduce((sum, res) => sum + res.utilization, 0) / currentProject.resources.length)
    : 0;
  
  // 找出利用率最高和最低的資源
  const sortedByUtilization = [...currentProject.resources].sort((a, b) => b.utilization - a.utilization);
  const highestUtilized = sortedByUtilization[0];
  const lowestUtilized = sortedByUtilization[sortedByUtilization.length - 1];
  
  // 依角色分組資源
  const resourcesByRole = currentProject.resources.reduce((acc: Record<string, number>, resource) => {
    const role = resource.role || '未指定';
    if (!acc[role]) {
      acc[role] = 0;
    }
    acc[role]++;
    return acc;
  }, {});
  
  // 獲取團隊資訊
  const getTeamName = (teamId?: string) => {
    if (!teamId) return '未分配';
    const team = currentProject.teams.find(t => t.id === teamId);
    return team ? team.name : '未分配';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm mb-8 border border-slate-100 overflow-hidden">
      <div className="relative bg-[url('https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 backdrop-blur-[1px]"></div>
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-lg font-semibold text-white">資源分配</h2>
            <button className="text-sm text-white hover:text-white/80 flex items-center">
              <span>查看詳情</span>
              <ArrowRight size={14} className="ml-1" />
            </button>
          </div>
          <p className="text-white/80 text-sm">團隊資源使用情況和分配</p>
        </div>
      </div>
      
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-slate-800 text-sm">整體資源利用率</h3>
              <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
                averageUtilization > 90 ? 'bg-rose-100 text-rose-800' :
                averageUtilization > 75 ? 'bg-amber-100 text-amber-800' :
                averageUtilization > 60 ? 'bg-emerald-100 text-emerald-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {averageUtilization}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  averageUtilization > 90 ? 'bg-rose-500' :
                  averageUtilization > 75 ? 'bg-amber-500' :
                  averageUtilization > 60 ? 'bg-emerald-500' :
                  'bg-gradient-to-r from-purple-500 to-indigo-500'
                }`}
                style={{ width: `${averageUtilization}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-slate-800 text-sm mb-3">團隊資源分配</h3>
            <div className="space-y-3">
              {currentProject.teams.map(team => {
                const teamResources = currentProject.resources.filter(r => r.teamId === team.id);
                const teamAverageUtilization = teamResources.length > 0
                  ? Math.round(teamResources.reduce((sum, res) => sum + res.utilization, 0) / teamResources.length)
                  : 0;
                
                return (
                  <div key={team.id} className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mr-3">
                      <Users size={18} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-medium text-sm text-slate-800 truncate">{team.name}</h4>
                        <span className="text-xs font-medium text-slate-500">{teamResources.length} 成員</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            teamAverageUtilization > 90 ? 'bg-rose-500' :
                            teamAverageUtilization > 75 ? 'bg-amber-500' :
                            teamAverageUtilization > 60 ? 'bg-emerald-500' :
                            'bg-gradient-to-r from-purple-500 to-indigo-500'
                          }`}
                          style={{ width: `${teamAverageUtilization}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-slate-800 text-sm mb-3">角色分佈</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(resourcesByRole).map(([role, count]) => (
                <div key={role} className="flex items-center p-3 border border-slate-200 rounded-lg bg-gradient-to-r from-white to-slate-50">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-slate-800 truncate">{role}</h4>
                    <span className="text-xs text-slate-500">{count} 人員</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-slate-800 text-sm mb-3">主要資源利用率</h3>
          <div className="space-y-4">
            {sortedByUtilization.slice(0, 5).map(resource => (
              <div key={resource.id} className="p-4 border border-slate-200 rounded-lg hover:border-purple-300 transition-colors bg-gradient-to-r from-white to-slate-50">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 mr-3">
                    {resource.avatar ? (
                      <img 
                        src={resource.avatar} 
                        alt={resource.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-medium text-slate-600">
                        {resource.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-slate-800 truncate">{resource.name}</h4>
                    <div className="flex items-center text-xs text-slate-500 truncate">
                      <span className="truncate">{resource.role}</span>
                      <span className="mx-1">•</span>
                      <span>{getTeamName(resource.teamId)}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ml-2 ${
                    resource.utilization > 90 ? 'bg-rose-100 text-rose-800' :
                    resource.utilization > 75 ? 'bg-amber-100 text-amber-800' :
                    resource.utilization > 60 ? 'bg-emerald-100 text-emerald-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {resource.utilization}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      resource.utilization > 90 ? 'bg-rose-500' :
                      resource.utilization > 75 ? 'bg-amber-500' :
                      resource.utilization > 60 ? 'bg-emerald-500' :
                      'bg-gradient-to-r from-purple-500 to-indigo-500'
                    }`}
                    style={{ width: `${resource.utilization}%` }}
                  ></div>
                </div>
                <div className="flex mt-3 text-xs">
                  <div className="flex items-center">
                    <BarChart size={12} className="text-slate-400 mr-1" />
                    <span className="text-slate-500">每小時 ${resource.cost}</span>
                  </div>
                  <div className="ml-auto">
                    <span className="text-slate-500">可用性: {resource.availability.length} 天/週</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50">
              <h4 className="text-sm font-medium text-slate-800 mb-1">最高利用率</h4>
              <div className="flex items-center">
                {highestUtilized && (
                  <>
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 mr-2">
                      {highestUtilized.avatar ? (
                        <img 
                          src={highestUtilized.avatar} 
                          alt={highestUtilized.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-medium text-slate-600">
                          {highestUtilized.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 truncate">{highestUtilized.name}</p>
                      <span className="text-xs text-slate-500">{highestUtilized.utilization}%</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="p-4 border border-slate-200 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50">
              <h4 className="text-sm font-medium text-slate-800 mb-1">最低利用率</h4>
              <div className="flex items-center">
                {lowestUtilized && (
                  <>
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 mr-2">
                      {lowestUtilized.avatar ? (
                        <img 
                          src={lowestUtilized.avatar} 
                          alt={lowestUtilized.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-medium text-slate-600">
                          {lowestUtilized.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 truncate">{lowestUtilized.name}</p>
                      <span className="text-xs text-slate-500">{lowestUtilized.utilization}%</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};