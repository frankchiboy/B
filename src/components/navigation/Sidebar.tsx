import React from 'react';
import { 
  LayoutDashboard, 
  GanttChart, 
  CheckSquare, 
  Users, 
  BarChart4, 
  Settings, 
  PlusCircle,
  Briefcase,
  Menu,
  X
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const [expanded, setExpanded] = React.useState(true);
  const { currentProject, projects } = useProject();

  const navItems = [
    { id: 'dashboard', label: '儀表板', icon: <LayoutDashboard size={20} /> },
    { id: 'gantt', label: '甘特圖', icon: <GanttChart size={20} /> },
    { id: 'tasks', label: '任務', icon: <CheckSquare size={20} /> },
    { id: 'resources', label: '資源', icon: <Users size={20} /> },
    { id: 'reports', label: '報告', icon: <BarChart4 size={20} /> },
    { id: 'settings', label: '設定', icon: <Settings size={20} /> },
  ];

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={`relative bg-[url('https://images.pexels.com/photos/7130560/pexels-photo-7130560.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center text-white transition-all duration-300 ease-in-out flex flex-col ${expanded ? 'w-64' : 'w-20'}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/90 via-indigo-900/90 to-blue-900/90 backdrop-blur-sm"></div>
      
      <div className="relative z-10 flex items-center p-4 border-b border-indigo-800/50">
        <div className="flex items-center">
          <div className="rounded-lg bg-gradient-to-tr from-pink-500 to-purple-600 p-2 mr-2">
            <Briefcase size={24} className="text-white" />
          </div>
          {expanded && <h1 className="text-xl font-bold tracking-tighter">ProjectCraft</h1>}
        </div>
        <button 
          onClick={toggleSidebar} 
          className="ml-auto p-1 rounded-full hover:bg-indigo-800/50 transition-colors"
        >
          {expanded ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      
      <div className="relative z-10 mt-4 px-3">
        {expanded && (
          <div className="flex items-center mb-3">
            <h2 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider">專案</h2>
            <button className="ml-auto p-1 rounded-full hover:bg-indigo-800/50 transition-colors">
              <PlusCircle size={16} className="text-indigo-300" />
            </button>
          </div>
        )}
        
        {expanded && currentProject && (
          <div className="mb-6">
            <div className="bg-indigo-800/40 rounded-lg p-3 mb-2 backdrop-blur-sm">
              <h3 className="font-medium text-sm mb-1 truncate">{currentProject.name}</h3>
              <div className="flex items-center text-xs text-indigo-300">
                <span className="truncate">進度: {currentProject.progress}%</span>
              </div>
              <div className="w-full bg-indigo-950/50 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-gradient-to-r from-pink-400 to-purple-500 h-1.5 rounded-full" 
                  style={{ width: `${currentProject.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <nav className="relative z-10 flex-1 px-3 mt-2">
        <ul className="space-y-1.5">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  currentView === item.id
                    ? 'bg-gradient-to-r from-purple-600/60 to-indigo-600/60 text-white backdrop-blur-sm'
                    : 'text-indigo-100 hover:bg-indigo-800/30 hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {expanded && <span>{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="relative z-10 mt-auto p-4 border-t border-indigo-800/50">
        {expanded && (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2 bg-indigo-700 flex items-center justify-center">
              <img 
                src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100" 
                alt="User avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium">Alex Chen</p>
              <p className="text-xs text-indigo-300">專案經理</p>
            </div>
          </div>
        )}
        {!expanded && (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-700 flex items-center justify-center">
              <img 
                src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100" 
                alt="User avatar" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};