import React, { useEffect, useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { getProjectSnapshots, loadSnapshot, deleteSnapshot } from '../services/snapshotManager';

interface SnapshotEntry {
  projectId: string;
  filename: string;
  timestamp: string;
  type: string;
  path: string;
}

export const SnapshotsView: React.FC = () => {
  const { currentProject, setCurrentProject } = useProject();
  const [snapshots, setSnapshots] = useState<SnapshotEntry[]>([]);

  useEffect(() => {
    const load = async () => {
      if (currentProject) {
        const list = await getProjectSnapshots(currentProject.id);
        setSnapshots(list.reverse());
      }
    };

    load();
  }, [currentProject]);

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        請先選擇一個專案
      </div>
    );
  }

  const handleRestore = async (path: string) => {
    const project = await loadSnapshot(path);
    if (project) {
      setCurrentProject(project);
    }
  };

  const handleDelete = async (path: string) => {
    await deleteSnapshot(path);
    setSnapshots(prev => prev.filter(s => s.path !== path));
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">快照管理</h2>
      <div className="space-y-2">
        {snapshots.map(snap => (
          <div key={snap.path} className="flex items-center justify-between bg-white shadow p-3 rounded">
            <div>
              <p className="font-medium">{snap.filename}</p>
              <p className="text-xs text-slate-500">{new Date(snap.timestamp).toLocaleString()} - {snap.type}</p>
            </div>
            <div className="space-x-2">
              <button onClick={() => handleRestore(snap.path)} className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded">還原</button>
              <button onClick={() => handleDelete(snap.path)} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded">刪除</button>
            </div>
          </div>
        ))}
        {snapshots.length === 0 && <p className="text-slate-500">尚無快照</p>}
      </div>
    </div>
  );
};

export default SnapshotsView;
