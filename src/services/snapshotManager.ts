import { createDir, writeBinaryFile, readBinaryFile, writeTextFile, readTextFile, exists, removeFile } from '@tauri-apps/api/fs';
import { appLocalDataDir } from '@tauri-apps/api/path';
import { Project, Task } from '../types/projectTypes';

interface SnapshotInfo {
  projectId: string;
  timestamp: string;
  type: string;
  path: string;
}
import JSZip from 'jszip';

const SNAPSHOT_DIR = 'backups';
const SNAPSHOT_INDEX = 'project_snap_index.json';

// 初始化快照目錄
async function initSnapshotDir() {
  try {
    const appDataDir = await appLocalDataDir();
    const snapshotDirPath = `${appDataDir}${SNAPSHOT_DIR}`;
    
    if (!(await exists(snapshotDirPath))) {
      await createDir(snapshotDirPath, { recursive: true });
    }
    
    return snapshotDirPath;
  } catch (error) {
    console.error('Failed to create snapshot directory:', error);
    throw error;
  }
}

// 創建快照
export async function createSnapshot(
  project: Project, 
  type: 'Auto' | 'Manual' | 'Crash Recovery' = 'Auto'
): Promise<string> {
  try {
    const snapshotDir = await initSnapshotDir();
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `${project.name}_${timestamp}.mpproj`;
    const path = `${snapshotDir}/${filename}`;
    
    // 建立 ZIP 檔案
    const zip = new JSZip();
    
    // 準備專案資料包
    const manifest = {
      project_uuid: project.id,
      file_version: "1.0.0",
      created_at: new Date().toISOString(),
      snapshot_type: type
    };
    
    const projectData = {
      project_name: project.name,
      description: project.description,
      start_date: project.startDate,
      end_date: project.endDate
    };
    
    // 添加各個 JSON 檔案
    zip.file("manifest.json", JSON.stringify(manifest, null, 2));
    zip.file("project.json", JSON.stringify(projectData, null, 2));
    zip.file("tasks.json", JSON.stringify(project.tasks, null, 2));
    zip.file("resources.json", JSON.stringify(project.resources, null, 2));
    zip.file("milestones.json", JSON.stringify(project.milestones, null, 2));
    zip.file("teams.json", JSON.stringify(project.teams, null, 2));
    zip.file("budget.json", JSON.stringify(project.budget, null, 2));
    // 使用 cost.json 以符合封裝規範
    zip.file("cost.json", JSON.stringify(project.costs, null, 2));
    zip.file("risklog.json", JSON.stringify(project.risks, null, 2));
    
    // 添加附件資料夾
    zip.folder("attachments");
    zip.folder("meta");
    
    // 生成 ZIP 檔案
    const zipContent = await zip.generateAsync({ type: "blob" });
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          if (reader.result) {
            const binaryStr = reader.result as ArrayBuffer;
            const uint8Array = new Uint8Array(binaryStr);
            await writeBinaryFile(path, uint8Array);
            
            // 更新索引檔案
            await updateSnapshotIndex(project.id, filename, timestamp, type, path);
            resolve(path);
          } else {
            reject(new Error("Failed to read ZIP content"));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error("Failed to read ZIP content"));
      };
      
      reader.readAsArrayBuffer(zipContent);
    });
  } catch (error) {
    console.error('Failed to create snapshot:', error);
    throw error;
  }
}

// 更新快照索引
async function updateSnapshotIndex(
  projectId: string, 
  filename: string, 
  timestamp: string, 
  type: string,
  path: string
) {
  try {
    const appDataDir = await appLocalDataDir();
    const indexPath = `${appDataDir}${SNAPSHOT_DIR}/${SNAPSHOT_INDEX}`;
    
    let snapshots = [];
    try {
      const content = await readTextFile(indexPath);
      snapshots = JSON.parse(content);
    } catch {
      // 索引檔案不存在，創建新的
      snapshots = [];
    }
    
    // 新增快照記錄
    snapshots.push({
      projectId,
      filename,
      timestamp,
      type,
      path
    });
    
    // 儲存更新後的索引
    await writeTextFile(indexPath, JSON.stringify(snapshots, null, 2));
  } catch (error) {
    console.error('Failed to update snapshot index:', error);
    throw error;
  }
}

// 取得專案的所有快照
export async function getProjectSnapshots(projectId: string): Promise<SnapshotInfo[]> {
  try {
    const appDataDir = await appLocalDataDir();
    const indexPath = `${appDataDir}${SNAPSHOT_DIR}/${SNAPSHOT_INDEX}`;
    
    if (!(await exists(indexPath))) {
      return [];
    }
    
    const content = await readTextFile(indexPath);
    const snapshots: SnapshotInfo[] = JSON.parse(content);
    
    // 過濾出特定專案的快照
    return snapshots.filter(snapshot => snapshot.projectId === projectId);
  } catch (error) {
    console.error('Failed to get project snapshots:', error);
    return [];
  }
}

// 載入快照
export async function loadSnapshot(snapshotPath: string): Promise<Project | null> {
  try {
    // 讀取 ZIP 檔案
    const contentBuffer = await readBinaryFile(snapshotPath);
    const zip = new JSZip();
    await zip.loadAsync(contentBuffer);
    
    // 讀取各個 JSON 檔案
    const manifestFile = await zip.file("manifest.json")?.async("string");
    const projectFile = await zip.file("project.json")?.async("string");
    const tasksFile = await zip.file("tasks.json")?.async("string");
    const resourcesFile = await zip.file("resources.json")?.async("string");
    const milestonesFile = await zip.file("milestones.json")?.async("string");
    const teamsFile = await zip.file("teams.json")?.async("string");
    const budgetFile = await zip.file("budget.json")?.async("string");
    // 同時檢查舊名 costs.json 與新名 cost.json
    const costsFile =
      (await zip.file("cost.json")?.async("string")) ||
      (await zip.file("costs.json")?.async("string"));
    const riskFile = await zip.file("risklog.json")?.async("string");
    
    if (!manifestFile || !projectFile) {
      throw new Error("Invalid snapshot file format");
    }
    
    const manifest = JSON.parse(manifestFile);
    const projectData = JSON.parse(projectFile);
    const tasks = tasksFile ? JSON.parse(tasksFile) : [];
    const resources = resourcesFile ? JSON.parse(resourcesFile) : [];
    const milestones = milestonesFile ? JSON.parse(milestonesFile) : [];
    const teams = teamsFile ? JSON.parse(teamsFile) : [];
    const budget = budgetFile ? JSON.parse(budgetFile) : {
      total: 0,
      spent: 0,
      remaining: 0,
      currency: 'USD',
      categories: []
    };
    const costs = costsFile ? JSON.parse(costsFile) : [];
    const risks = riskFile ? JSON.parse(riskFile) : [];
    
    return {
      id: manifest.project_uuid,
      name: projectData.project_name,
      description: projectData.description,
      startDate: projectData.start_date,
      endDate: projectData.end_date,
      tasks: tasks,
      resources: resources,
      milestones: milestones,
      teams: teams,
      budget: budget,
      costs: costs,
      risks: risks,
      status: 'active',
      progress: calculateProgress(tasks),
      createdAt: manifest.created_at,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to load snapshot:', error);
    return null;
  }
}

// 計算專案進度
function calculateProgress(tasks: Task[]): number {
  if (!tasks || tasks.length === 0) return 0;
  
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === 'completed').length;
  
  return Math.round((completed / total) * 100);
}

// 建立崩潰恢復快照
export async function createCrashRecoverySnapshot(project: Project): Promise<void> {
  try {
    await createSnapshot(project, 'Crash Recovery');
  } catch (error) {
    console.error('Failed to create crash recovery snapshot:', error);
  }
}

// 刪除快照
export async function deleteSnapshot(snapshotPath: string): Promise<void> {
  try {
    const appDataDir = await appLocalDataDir();
    const indexPath = `${appDataDir}${SNAPSHOT_DIR}/${SNAPSHOT_INDEX}`;

    // 刪除檔案
    await removeFile(snapshotPath);

    // 更新索引
    if (await exists(indexPath)) {
      try {
        const content = await readTextFile(indexPath);
        let snapshots: SnapshotInfo[] = JSON.parse(content);

        snapshots = snapshots.filter(s => s.path !== snapshotPath);

        await writeTextFile(indexPath, JSON.stringify(snapshots, null, 2));
      } catch (error) {
        console.error('Failed to update snapshot index:', error);
      }
    }
  } catch (error) {
    console.error('Failed to delete snapshot:', error);
  }
}