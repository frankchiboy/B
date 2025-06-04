import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { CostItem } from '../types/projectTypes';

export const CostsView: React.FC = () => {
  const { currentProject, addCost, updateCost, deleteCost } = useProject();
  const [showForm, setShowForm] = useState(false);
  const [newCost, setNewCost] = useState<Omit<CostItem, 'id'>>({
    task_id: '',
    amount: 0,
    category: '人事',
    currency: 'USD',
    date: new Date().toISOString().substring(0,10),
    invoice_id: '',
    status: 'pending',
    note: ''
  });

  if (!currentProject) {
    return <div className="flex items-center justify-center h-full text-slate-500">請先選擇一個專案</div>;
  }

  const handleAdd = () => {
    const cost: CostItem = { id: crypto.randomUUID(), ...newCost };
    addCost(cost);
    setShowForm(false);
    setNewCost({ ...newCost, task_id: '', amount: 0, invoice_id: '', note: '' });
  };

  const handleUpdate = (cost: CostItem, field: keyof CostItem, value: any) => {
    updateCost({ ...cost, [field]: value });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">成本紀錄</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded">
          新增成本
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow rounded p-4 space-y-3">
          <input type="text" value={newCost.task_id} onChange={e => setNewCost({ ...newCost, task_id: e.target.value })} placeholder="任務 ID" className="border p-2 w-full" />
          <input type="number" value={newCost.amount} onChange={e => setNewCost({ ...newCost, amount: Number(e.target.value) })} placeholder="金額" className="border p-2 w-full" />
          <select value={newCost.category} onChange={e => setNewCost({ ...newCost, category: e.target.value as CostItem['category'] })} className="border p-2 w-full">
            <option value="人事">人事</option>
            <option value="設備">設備</option>
            <option value="其他">其他</option>
          </select>
          <input type="text" value={newCost.currency} onChange={e => setNewCost({ ...newCost, currency: e.target.value })} placeholder="貨幣" className="border p-2 w-full" />
          <input type="date" value={newCost.date} onChange={e => setNewCost({ ...newCost, date: e.target.value })} className="border p-2 w-full" />
          <input type="text" value={newCost.invoice_id} onChange={e => setNewCost({ ...newCost, invoice_id: e.target.value })} placeholder="發票號碼" className="border p-2 w-full" />
          <select value={newCost.status} onChange={e => setNewCost({ ...newCost, status: e.target.value as CostItem['status'] })} className="border p-2 w-full">
            <option value="pending">待付款</option>
            <option value="paid">已付款</option>
          </select>
          <textarea value={newCost.note} onChange={e => setNewCost({ ...newCost, note: e.target.value })} placeholder="備註" className="border p-2 w-full" />
          <button onClick={handleAdd} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded">儲存</button>
        </div>
      )}

      <table className="min-w-full divide-y divide-slate-200 bg-white shadow rounded">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">任務ID</th>
            <th className="px-4 py-2 text-right">金額</th>
            <th className="px-4 py-2 text-left">類別</th>
            <th className="px-4 py-2 text-left">狀態</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {currentProject.costs.map(cost => (
            <tr key={cost.id} className="border-t">
              <td className="px-4 py-2">{cost.task_id}</td>
              <td className="px-4 py-2 text-right">
                <input type="number" value={cost.amount} onChange={e => handleUpdate(cost, 'amount', Number(e.target.value))} className="border p-1 w-24" />
              </td>
              <td className="px-4 py-2">
                <select value={cost.category} onChange={e => handleUpdate(cost, 'category', e.target.value)} className="border p-1">
                  <option value="人事">人事</option>
                  <option value="設備">設備</option>
                  <option value="其他">其他</option>
                </select>
              </td>
              <td className="px-4 py-2">
                <select value={cost.status} onChange={e => handleUpdate(cost, 'status', e.target.value)} className="border p-1">
                  <option value="pending">待付款</option>
                  <option value="paid">已付款</option>
                </select>
              </td>
              <td className="px-4 py-2 text-right">
                <button onClick={() => deleteCost(cost.id)} className="text-red-600 hover:underline">刪除</button>
              </td>
            </tr>
          ))}
          {currentProject.costs.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-4 text-center text-slate-500">尚無成本紀錄</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CostsView;
