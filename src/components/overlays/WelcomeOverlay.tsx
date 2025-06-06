import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, ArrowRight, Briefcase } from 'lucide-react';

interface WelcomeOverlayProps {
  onClose: () => void;
}

interface StepInfo {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  bgImage: string;
}

const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps: StepInfo[] = [
    {
      title: "歡迎使用 ProjectCraft",
      description: "我們重新定義了專業專案管理。探索強大的功能，優化您的工作流程，並帶領您的團隊取得成功。",
      icon: <Briefcase size={32} />,
      buttonText: "開始使用",
      bgImage: "https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    },
    {
      title: "建立您的專案",
      description: "從零開始或使用我們的範本快速建立專案。定義里程碑、設定目標，並規劃您的路徑。",
      icon: <CheckCircle size={32} />,
      buttonText: "下一步",
      bgImage: "https://images.pexels.com/photos/3183186/pexels-photo-3183186.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    },
    {
      title: "邀請您的團隊",
      description: "專案管理是一項團隊任務。邀請成員、分配角色，並設定權限以確保順暢的協作。",
      icon: <AlertCircle size={32} />,
      buttonText: "完成",
      bgImage: "https://images.pexels.com/photos/3182746/pexels-photo-3182746.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    }
  ];
  
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };
  
  const currentStepInfo = steps[currentStep];
  
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 transition-colors z-20"
        >
          <X size={20} className="text-slate-500" />
        </button>
        
        <div className={`relative bg-[url('${currentStepInfo.bgImage}')] bg-cover bg-center p-8 text-white`}>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-indigo-900/80 backdrop-blur-[1px]"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
              {currentStepInfo.icon}
            </div>
            <h2 className="text-3xl font-bold mb-3">{currentStepInfo.title}</h2>
            <p className="text-lg text-white/90 mb-6 max-w-xl">{currentStepInfo.description}</p>
            
            <div className="flex space-x-2 mt-8">
              {steps.map((_, index) => (
                <div 
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentStep ? 'bg-white w-8' : 'bg-white/30 w-4'
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-8">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">快速指南</h3>
          
          <div className="space-y-5">
            <Feature 
              isActive={true}
              title="儀表板概覽"
              description="獲取專案關鍵指標的視覺摘要，包括進度、資源和即將到來的里程碑。"
            />
            <Feature 
              isActive={true}
              title="甘特圖視圖"
              description="視覺化排程和管理任務時間表，讓您的專案保持在正軌上。"
            />
            <Feature 
              isActive={true}
              title="資源管理"
              description="追蹤團隊成員的工作負載、可用性和利用率，以優化資源分配。"
            />
            <Feature 
              isActive={currentStep >= 1}
              title="任務管理"
              description="建立、分配和追蹤任務，設定優先級並監控進度。"
            />
            <Feature 
              isActive={currentStep >= 2}
              title="團隊協作"
              description="促進團隊溝通、檔案共享和即時更新，提高生產力。"
            />
          </div>
          
          <div className="mt-8 flex justify-between items-center">
            <button 
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 text-sm font-medium"
            >
              稍後再說
            </button>
            
            <button 
              onClick={handleNextStep}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
            >
              {currentStepInfo.buttonText}
              <ArrowRight size={16} className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FeatureProps {
  isActive: boolean;
  title: string;
  description: string;
}

const Feature: React.FC<FeatureProps> = ({ isActive, title, description }) => (
  <div className={`flex items-start transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
    <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
      isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
    }`}>
      <CheckCircle size={14} />
    </div>
    <div className="ml-3">
      <h4 className="font-medium text-slate-800">{title}</h4>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  </div>
);

export default WelcomeOverlay;