import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { Risk } from '../types/projectTypes';
import { Plus } from 'lucide-react';

export const RisksView: React.FC = () => {
  const { currentProject, addRisk, updateRisk, deleteRisk } = useProject();
  const [showForm, setShowForm] = useState(false);
  const [newRisk, setNewRisk] = useState<Omit<Risk, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    probability: 'low',
    impact: 'low',
    status: 'identified',
    mitigation: '',
    owner: ''
  });

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        請先選擇一個專案
      </div>
    );
  }

  const handleAdd = () => {
    const risk: Risk = {
      id: crypto.randomUUID(),
      ...newRisk,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    addRisk(risk);
    setShowForm(false);
    setNewRisk({
      name: '',
      description: '',
      probability: 'low',
      impact: 'low',
      status: 'identified',
      mitigation: '',
      owner: ''
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">風險列表</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
        >
          <Plus size={16} className="mr-1" /> 新增風險
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow rounded p-4 space-y-3">
          <div>
            <input
              type="text"
              value={newRisk.name}
              onChange={e => setNewRisk({ ...newRisk, name: e.target.value })}
              placeholder="風險名稱"
              className="border p-2 w-full mb-2"
            />
            <textarea
              value={newRisk.description}
              onChange={e => setNewRisk({ ...newRisk, description: e.target.value })}
              placeholder="描述"
              className="border p-2 w-full mb-2"
            />
            <div className="flex gap-2">
              <select
                value={newRisk.probability}
                onChange={e => setNewRisk({ ...newRisk, probability: e.target.value as any })}
                className="border p-2 flex-1"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
              <select
                value={newRisk.impact}
                onChange={e => setNewRisk({ ...newRisk, impact: e.target.value as any })}
                className="border p-2 flex-1"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
            <input
              type="text"
              value={newRisk.mitigation}
              onChange={e => setNewRisk({ ...newRisk, mitigation: e.target.value })}
              placeholder="因應措施"
              className="border p-2 w-full mb-2"
            />
            <input
              type="text"
              value={newRisk.owner}
              onChange={e => setNewRisk({ ...newRisk, owner: e.target.value })}
              placeholder="負責人ID"
              className="border p-2 w-full mb-2"
            />
            <button
              onClick={handleAdd}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded"
            >
              儲存
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {currentProject.risks.map(risk => (
          <div key={risk.id} className="bg-white rounded shadow p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{risk.name}</h3>
                <p className="text-sm text-slate-600">{risk.description}</p>
              </div>
              <button
                onClick={() => deleteRisk(risk.id)}
                className="text-red-600 hover:underline"
              >
                刪除
              </button>
            </div>
            <div className="text-sm mt-2 text-slate-500">
              可能性：{risk.probability}、影響：{risk.impact}
            </div>
            <div className="text-sm text-slate-500">負責人：{risk.owner}</div>
          </div>
        ))}
        {currentProject.risks.length === 0 && (
          <p className="text-slate-500">尚未記錄風險</p>
        )}
      </div>
    </div>
  );
};

