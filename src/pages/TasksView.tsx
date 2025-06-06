import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { Calendar, Clock, Users, CheckSquare, List, Grid, Filter, Search, Plus, ArrowUpDown, Bookmark, MoreHorizontal, ChevronDown } from 'lucide-react';
import { Task } from '../types/projectTypes';

export const TasksView: React.FC = () => {
  const { currentProject } = useProject();
  const [viewType, setViewType] = useState<'list' | 'board'>('board');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-slate-500">請先選擇一個專案</p>
        </div>
      </div>
    );
  }
  
  // 過濾任務
  const getFilteredTasks = (): Task[] => {
    let filtered = [...currentProject.tasks];
    
    // 依狀態過濾
    if (filterStatus) {
      filtered = filtered.filter(task => task.status === filterStatus);
    }
    
    // 依搜尋條件過濾
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(task => 
        task.name.toLowerCase().includes(query) || 
        task.description.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };
  
  const filteredTasks = getFilteredTasks();
  
  // 依狀態分組任務
  const getStatusGroups = () => {
    const groups: Record<string, Task[]> = {
      'not-started': [],
      'in-progress': [],
      'delayed': [],
      'completed': []
    };
    
    filteredTasks.forEach(task => {
      groups[task.status].push(task);
    });
    
    return groups;
  };
  
  const tasksByStatus = getStatusGroups();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started': return 'bg-slate-500';
      case 'in-progress': return 'bg-purple-500';
      case 'delayed': return 'bg-rose-500';
      case 'completed': return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'not-started': return '未開始';
      case 'in-progress': return '進行中';
      case 'delayed': return '已延遲';
      case 'completed': return '已完成';
      default: return status;
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-slate-100 text-slate-800';
      case 'medium': return 'bg-purple-100 text-purple-800';
      case 'high': return 'bg-amber-100 text-amber-800';
      case 'urgent': return 'bg-rose-100 text-rose-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };
  
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return '低';
      case 'medium': return '中';
      case 'high': return '高';
      case 'urgent': return '緊急';
      default: return priority;
    }
  };
  
  
  return (
    <div className="flex flex-col h-full">
      <div className="relative bg-[url('https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center border-b border-slate-200">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 backdrop-blur-[1px] rounded-b-xl"></div>
        
        <div className="relative z-10 p-6">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜尋任務..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-64 bg-white/10 border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-white/70"
                />
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
              </div>
              
              <div className="flex items-center space-x-1 border border-white/30 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewType('board')}
                  className={`p-2 ${
                    viewType === 'board' 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/70 hover:bg-white/10'
                  } transition-colors`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewType('list')}
                  className={`p-2 ${
                    viewType === 'list' 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/70 hover:bg-white/10'
                  } transition-colors`}
                >
                  <List size={16} />
                </button>
              </div>
              
              <button className="px-3 py-2 border border-white/30 rounded-lg text-white hover:bg-white/10 transition-colors text-sm flex items-center">
                <Filter size={14} className="mr-1.5" />
                篩選
                <ChevronDown size={14} className="ml-1.5" />
              </button>
              
              <div className="flex space-x-1">
                <button 
                  onClick={() => setFilterStatus(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterStatus === null ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  全部
                </button>
                <button 
                  onClick={() => setFilterStatus('not-started')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterStatus === 'not-started' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  未開始
                </button>
                <button 
                  onClick={() => setFilterStatus('in-progress')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterStatus === 'in-progress' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  進行中
                </button>
                <button 
                  onClick={() => setFilterStatus('delayed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterStatus === 'delayed' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  已延遲
                </button>
                <button 
                  onClick={() => setFilterStatus('completed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterStatus === 'completed' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  已完成
                </button>
              </div>
            </div>
            
            <button className="px-4 py-2 bg-white text-purple-700 rounded-lg text-sm flex items-center shadow-sm hover:bg-purple-50 transition-colors">
              <Plus size={14} className="mr-1.5" />
              新增任務
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6 relative">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/60 to-slate-100/60 backdrop-blur-[1px]"></div>
        </div>
        <div className="relative z-10">
        {viewType === 'board' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
            {Object.entries(tasksByStatus).map(([status, tasks]) => (
              <div 
                key={status}
                className="flex flex-col bg-white/80 backdrop-blur-sm rounded-xl shadow-sm h-full max-h-full overflow-hidden border border-slate-200"
              >
                <div className="relative bg-[url('https://images.pexels.com/photos/3183132/pexels-photo-3183132.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 backdrop-blur-[1px]"></div>
                  <div className="p-4 flex items-center sticky top-0 z-10 relative">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(status)} mr-2`}></div>
                  <h3 className="font-medium text-white">{getStatusText(status)}</h3>
                  <span className="ml-2 text-xs font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                    {tasks.length}
                  </span>
                  </div>
                </div>
                
                <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                  {tasks.length > 0 ? (
                    tasks.map(task => (
                      <div 
                        key={task.id}
                        className="relative bg-[url('https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center p-4 rounded-lg border border-slate-200 hover:border-purple-300 transition-colors overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-slate-50/90 backdrop-blur-[1px]"></div>
                        <div className="relative z-10">
                        <div className="flex items-start mb-2">
                          {task.isMilestone && (
                            <div className="p-1 mr-1 rounded bg-amber-100">
                              <Bookmark size={12} className="text-amber-600" />
                            </div>
                          )}
                          <h4 className="text-sm font-medium text-slate-800 flex-1">{task.name}</h4>
                          <button className="text-slate-400 hover:text-slate-600">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                        
                        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">進度</span>
                            <span className="font-medium text-slate-700">{task.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1">
                            <div 
                              className={`h-1 rounded-full ${
                                status === 'delayed' ? 'bg-rose-500' : 
                                task.progress > 75 ? 'bg-emerald-500' : 
                                'bg-gradient-to-r from-purple-500 to-indigo-500'
                              }`}
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center text-slate-500">
                            <Clock size={12} className="mr-1" />
                            <span>{new Date(task.endDate).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                              {getPriorityText(task.priority)}
                            </span>
                            
                            <div className="flex -space-x-1">
                              {task.assignedTo.slice(0, 2).map(resourceId => {
                                const resource = currentProject.resources.find(r => r.id === resourceId);
                                return (
                                  <div key={resourceId} className="w-5 h-5 rounded-full border border-white overflow-hidden bg-slate-200">
                                    {resource?.avatar ? (
                                      <img 
                                        src={resource.avatar} 
                                        alt={resource.name} 
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-[8px] font-medium text-slate-600">
                                        {resource?.name.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                              {task.assignedTo.length > 2 && (
                                <div className="w-5 h-5 rounded-full border border-white bg-slate-100 flex items-center justify-center text-[8px] font-medium text-slate-600">
                                  +{task.assignedTo.length - 2}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center py-6 text-center">
                      <p className="text-sm text-slate-500">沒有任務</p>
                    </div>
                  )}
                </div>
                
                <div className="p-3 border-t border-slate-200 bg-white">
                  <button className="w-full py-1.5 text-sm text-purple-600 hover:text-purple-800 flex items-center justify-center">
                    <Plus size={14} className="mr-1" />
                    新增任務
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 bg-white/80 backdrop-blur-sm">
                <thead>
                  <tr>
                    <th className="relative px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3183132/pexels-photo-3183132.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center opacity-50"></div>
                      <div className="relative z-10">
                        <div className="flex items-center">
                          <CheckSquare size={14} className="mr-2" />
                          任務名稱
                          <ArrowUpDown size={14} className="ml-1 text-slate-400" />
                        </div>
                      </div>
                    </th>
                    <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        狀態
                      </div>
                    </th>
                    <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        優先級
                      </div>
                    </th>
                    <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-2" />
                        截止日期
                      </div>
                    </th>
                    <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <Users size={14} className="mr-2" />
                        指派給
                      </div>
                    </th>
                    <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        進度
                      </div>
                    </th>
                    <th className="px-6 py-3 bg-slate-50"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                      <tr key={task.id} className="relative hover:bg-slate-50/80 transition-colors">
                        <td className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center opacity-10"></td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-start">
                            {task.isMilestone && (
                              <div className="p-1 mr-2 rounded bg-amber-100">
                                <Bookmark size={12} className="text-amber-600" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-slate-800">{task.name}</div>
                              <div className="text-xs text-slate-500 truncate max-w-xs">{task.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            task.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                            task.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
                            task.status === 'delayed' ? 'bg-rose-100 text-rose-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {getStatusText(task.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {getPriorityText(task.priority)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600">{new Date(task.endDate).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex -space-x-1">
                            {task.assignedTo.slice(0, 3).map(resourceId => {
                              const resource = currentProject.resources.find(r => r.id === resourceId);
                              return (
                                <div key={resourceId} className="w-6 h-6 rounded-full border border-white overflow-hidden bg-slate-200" title={resource?.name}>
                                  {resource?.avatar ? (
                                    <img 
                                      src={resource.avatar} 
                                      alt={resource.name} 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-medium text-slate-600">
                                      {resource?.name.charAt(0)}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {task.assignedTo.length > 3 && (
                              <div className="w-6 h-6 rounded-full border border-white bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                                +{task.assignedTo.length - 3}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-slate-100 rounded-full h-1.5 mr-2">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  task.status === 'delayed' ? 'bg-rose-500' : 
                                  task.progress > 75 ? 'bg-emerald-500' : 
                                  'bg-gradient-to-r from-purple-500 to-indigo-500'
                                }`}
                                style={{ width: `${task.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-slate-600">{task.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-purple-600 hover:text-purple-900">編輯</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <p className="text-slate-500">沒有找到符合條件的任務</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};