import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { BudgetCategory } from '../types/projectTypes';
import { Plus } from 'lucide-react';

export const BudgetView: React.FC = () => {
  const { currentProject, addBudgetCategory, updateBudgetCategory, deleteBudgetCategory } = useProject();
  const [showForm, setShowForm] = useState(false);
  const [newCategory, setNewCategory] = useState<Omit<BudgetCategory,'id'>>({ name: '', planned: 0, actual: 0 });

  if (!currentProject) {
    return <div className="flex items-center justify-center h-full text-slate-500">請先選擇一個專案</div>;
  }

  const handleAdd = () => {
    const category: BudgetCategory = { id: crypto.randomUUID(), ...newCategory };
    addBudgetCategory(category);
    setShowForm(false);
    setNewCategory({ name: '', planned: 0, actual: 0 });
  };

  const handleUpdate = (category: BudgetCategory, field: 'planned' | 'actual', value: number) => {
    updateBudgetCategory({ ...category, [field]: value });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">預算</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded">
          <Plus size={16} className="mr-1" /> 新增類別
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow rounded p-4 space-y-3">
          <input type="text" value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} placeholder="類別名稱" className="border p-2 w-full mb-2" />
          <input type="number" value={newCategory.planned} onChange={e => setNewCategory({ ...newCategory, planned: Number(e.target.value) })} placeholder="預算" className="border p-2 w-full mb-2" />
          <input type="number" value={newCategory.actual} onChange={e => setNewCategory({ ...newCategory, actual: Number(e.target.value) })} placeholder="實際" className="border p-2 w-full mb-2" />
          <button onClick={handleAdd} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded">儲存</button>
        </div>
      )}

      <table className="min-w-full divide-y divide-slate-200 bg-white shadow rounded">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">類別</th>
            <th className="px-4 py-2 text-right">預算</th>
            <th className="px-4 py-2 text-right">實際</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {currentProject.budget.categories.map(cat => (
            <tr key={cat.id} className="border-t">
              <td className="px-4 py-2">{cat.name}</td>
              <td className="px-4 py-2 text-right">
                <input type="number" value={cat.planned} onChange={e => handleUpdate(cat, 'planned', Number(e.target.value))} className="border p-1 w-24" />
              </td>
              <td className="px-4 py-2 text-right">
                <input type="number" value={cat.actual} onChange={e => handleUpdate(cat, 'actual', Number(e.target.value))} className="border p-1 w-24" />
              </td>
              <td className="px-4 py-2 text-right">
                <button onClick={() => deleteBudgetCategory(cat.id)} className="text-red-600 hover:underline">刪除</button>
              </td>
            </tr>
          ))}
          {currentProject.budget.categories.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-4 text-center text-slate-500">尚無預算類別</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="text-right">
        <p>總預算：{currentProject.budget.total}{currentProject.budget.currency}</p>
        <p>已使用：{currentProject.budget.spent}{currentProject.budget.currency}</p>
        <p>剩餘：{currentProject.budget.remaining}{currentProject.budget.currency}</p>
      </div>
    </div>
  );
};

export default BudgetView;
