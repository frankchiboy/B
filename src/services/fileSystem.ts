import { invoke } from '@tauri-apps/api/tauri';
import { save, open } from '@tauri-apps/api/dialog';
import { writeBinaryFile, readBinaryFile, writeTextFile, readTextFile, createDir, exists } from '@tauri-apps/api/fs';
import { appLocalDataDir } from '@tauri-apps/api/path';
import { Project, Task } from '../types/projectTypes';
import JSZip from 'jszip';

// 專案檔案儲存
export async function saveProject(project: Project, path?: string): Promise<string> {
  try {
    // 如果沒有路徑，開啟儲存對話框
    if (!path) {
      path = await save({
        filters: [{
          name: 'Project Files',
          extensions: ['mpproj']
        }]
      });
    }
    
    if (!path) return ''; // 使用者取消
    
    // 建立完整的專案資料包
    const projectPackage = {
      manifest: {
        project_uuid: project.id,
        file_version: "1.0.0",
        created_platform: await invoke('get_platform'),
        created_with_version: "1.0.0"
      },
      project: {
        project_name: project.name,
        description: project.description,
        created_by: "User",
        start_date: project.startDate,
        end_date: project.endDate
      },
      tasks: project.tasks,
      resources: project.resources,
      milestones: project.milestones,
      teams: project.teams,
      budget: project.budget,
      risks: project.risks,
      costs: project.costs
    };
    
    // 建立 ZIP 檔案
    const zip = new JSZip();
    
    // 添加各個 JSON 檔案
    zip.file("manifest.json", JSON.stringify(projectPackage.manifest, null, 2));
    zip.file("project.json", JSON.stringify(projectPackage.project, null, 2));
    zip.file("tasks.json", JSON.stringify(projectPackage.tasks, null, 2));
    zip.file("resources.json", JSON.stringify(projectPackage.resources, null, 2));
    zip.file("milestones.json", JSON.stringify(projectPackage.milestones, null, 2));
    zip.file("teams.json", JSON.stringify(projectPackage.teams, null, 2));
    zip.file("budget.json", JSON.stringify(projectPackage.budget, null, 2));
    zip.file("risklog.json", JSON.stringify(projectPackage.risks, null, 2));
    // 成本資料使用單數檔名 cost.json
    zip.file("cost.json", JSON.stringify(projectPackage.costs, null, 2));
    
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
            await writeBinaryFile(path as string, uint8Array);
            
            // 更新最近專案列表
            await updateRecentProjects(project.name, path as string, project.id);
            resolve(path as string);
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
    console.error('Failed to save project:', error);
    throw error;
  }
}

// 開啟專案檔案
export async function openProject(): Promise<Project | null> {
  try {
    const path = await open({
      filters: [{
        name: 'Project Files',
        extensions: ['mpproj', 'json']
      }]
    });
    
    if (!path) return null; // 使用者取消
    
    // 讀取檔案
    const contentBuffer = await readBinaryFile(path as string);
    const content = new Uint8Array(contentBuffer);
      const projectData = JSON.parse(new TextDecoder().decode(content));
        costs: projectData.costs || [],
        const costsFile = await zipData.file("costs.json")?.async("string");
        const costs = costsFile ? JSON.parse(costsFile) : [];
          costs: costs,
    
    // 嘗試解析 JSON
    try {
      // 先嘗試直接解析 JSON
      const projectData = JSON.parse(new TextDecoder().decode(content));
      
    } catch {
      const project = {
        id: projectData.manifest?.project_uuid || crypto.randomUUID(),
        name: projectData.project?.project_name || "Untitled Project",
        description: projectData.project?.description || "",
        startDate: projectData.project?.start_date || new Date().toISOString(),
        endDate: projectData.project?.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        tasks: projectData.tasks || [],
        resources: projectData.resources || [],
        milestones: projectData.milestones || [],
        teams: projectData.teams || [],
        budget: projectData.budget || {
          total: 0,
          spent: 0,
          remaining: 0,
          currency: 'USD',
        // 舊版可能使用成本檔名 costs.json，仍需兼容
        const costsFile =
          (await zipData.file("cost.json")?.async("string")) ||
          (await zipData.file("costs.json")?.async("string"));
        },
        risks: projectData.risks || [],
        status: 'active',
        progress: calculateProgress(projectData.tasks || []),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // 更新最近專案列表
      await updateRecentProjects(project.name, path as string, project.id);
      
      return project;
    } catch (e) {
      // JSON 解析失敗，嘗試作為 ZIP 檔案讀取
      try {
        // 使用 JSZip 載入 ZIP 檔案
        const zip = new JSZip();
        const zipData = await zip.loadAsync(content);
        
        // 讀取各個 JSON 檔案
        const manifestFile = await zipData.file("manifest.json")?.async("string");
        const projectFile = await zipData.file("project.json")?.async("string");
        const tasksFile = await zipData.file("tasks.json")?.async("string");
        const resourcesFile = await zipData.file("resources.json")?.async("string");
        const milestonesFile = await zipData.file("milestones.json")?.async("string");
        const teamsFile = await zipData.file("teams.json")?.async("string");
        const budgetFile = await zipData.file("budget.json")?.async("string");
        const riskFile = await zipData.file("risklog.json")?.async("string");
        
        if (!manifestFile || !projectFile) {
          throw new Error("Invalid project file format");
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
        const risks = riskFile ? JSON.parse(riskFile) : [];
        
        // 更新最近專案列表
        const project = {
          id: manifest.project_uuid,
          name: projectData.project_name,
          description: projectData.description,
          startDate: projectData.start_date,
          endDate: projectData.end_date,
// 直接從指定路徑開啟專案檔案
export async function openProjectFromPath(path: string): Promise<Project | null> {
  try {
    const contentBuffer = await readBinaryFile(path);
    const content = new Uint8Array(contentBuffer);

    try {
      const projectData = JSON.parse(new TextDecoder().decode(content));
      const project = {
        id: projectData.manifest?.project_uuid || crypto.randomUUID(),
        name: projectData.project?.project_name || 'Untitled Project',
        description: projectData.project?.description || '',
        startDate: projectData.project?.start_date || new Date().toISOString(),
        endDate:
          projectData.project?.end_date ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        tasks: projectData.tasks || [],
        resources: projectData.resources || [],
        milestones: projectData.milestones || [],
        teams: projectData.teams || [],
        budget:
          projectData.budget || {
            total: 0,
            spent: 0,
            remaining: 0,
            currency: 'USD',
            categories: [],
          },
        costs: projectData.costs || [],
        risks: projectData.risks || [],
        status: 'active',
        progress: calculateProgress(projectData.tasks || []),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Project;

      await updateRecentProjects(project.name, path, project.id);

      return project;
    } catch {
      try {
        const zip = new JSZip();
        const zipData = await zip.loadAsync(content);

        const manifestFile = await zipData.file('manifest.json')?.async('string');
        const projectFile = await zipData.file('project.json')?.async('string');
        const tasksFile = await zipData.file('tasks.json')?.async('string');
        const resourcesFile = await zipData.file('resources.json')?.async('string');
        const milestonesFile = await zipData.file('milestones.json')?.async('string');
        const teamsFile = await zipData.file('teams.json')?.async('string');
        const budgetFile = await zipData.file('budget.json')?.async('string');
        const riskFile = await zipData.file('risklog.json')?.async('string');
        const costsFile =
          (await zipData.file('cost.json')?.async('string')) ||
          (await zipData.file('costs.json')?.async('string'));

        if (!manifestFile || !projectFile) {
          throw new Error('Invalid project file format');
        }

        const manifest = JSON.parse(manifestFile);
        const projectData = JSON.parse(projectFile);
        const tasks = tasksFile ? JSON.parse(tasksFile) : [];
        const resources = resourcesFile ? JSON.parse(resourcesFile) : [];
        const milestones = milestonesFile ? JSON.parse(milestonesFile) : [];
        const teams = teamsFile ? JSON.parse(teamsFile) : [];
        const budget = budgetFile
          ? JSON.parse(budgetFile)
          : {
              total: 0,
              spent: 0,
              remaining: 0,
              currency: 'USD',
              categories: [],
            };
        const risks = riskFile ? JSON.parse(riskFile) : [];
        const costs = costsFile ? JSON.parse(costsFile) : [];

        const project = {
          id: manifest.project_uuid,
          name: projectData.project_name,
          description: projectData.description,
          startDate: projectData.start_date,
          endDate: projectData.end_date,
          tasks,
          resources,
          milestones,
          teams,
          budget,
          costs,
          risks,
          status: 'active',
          progress: calculateProgress(tasks),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Project;

        await updateRecentProjects(project.name, path, project.id);

        return project;
      } catch (zipError) {
        console.error('Failed to parse ZIP file:', zipError);
        throw new Error('Invalid project file format');
      }
    }
  } catch (error) {
    console.error('Failed to open project:', error);
    throw error;
  }
}

          tasks: tasks,
function calculateProgress(tasks: Task[]): number {
    const existingIndex = recentProjects.findIndex(
      (p: { projectUUID: string }) => p.projectUUID === id
    );
    const crashRecoveries = snapshots
      .filter((s: { type: string }) => s.type === 'Crash Recovery')
      .sort(
        (a: { timestamp: string }, b: { timestamp: string }) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await updateRecentProjects(project.name, path as string, project.id);
        
        return project;
      } catch (zipError) {
        console.error('Failed to parse ZIP file:', zipError);
        throw new Error("Invalid project file format");
      }
    }
  } catch (error) {
    console.error('Failed to open project:', error);
    throw error;
  }
}

// 計算專案進度
function calculateProgress(tasks: any[]): number {
  if (!tasks || tasks.length === 0) return 0;
  
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === 'completed').length;
  
  return Math.round((completed / total) * 100);
}

// 更新最近專案列表
async function updateRecentProjects(name: string, path: string, id: string): Promise<void> {
  try {
    const appDataDir = await appLocalDataDir();
    const recentProjectsPath = `${appDataDir}recent_projects.json`;
    
    // 確保目錄存在
    if (!(await exists(appDataDir))) {
      await createDir(appDataDir, { recursive: true });
    }
    
    // 讀取現有列表
    let recentProjects = [];
    try {
      const content = await readTextFile(recentProjectsPath);
      recentProjects = JSON.parse(content);
    } catch {
      // 檔案不存在，建立新列表
      recentProjects = [];
    }
    
    // 更新或新增專案記錄
// 從最近開啟列表中移除專案
export async function removeRecentProject(path: string): Promise<void> {
  try {
    const appDataDir = await appLocalDataDir();
    const recentProjectsPath = `${appDataDir}recent_projects.json`;

    if (!(await exists(recentProjectsPath))) {
      return;
    }

    const content = await readTextFile(recentProjectsPath);
    let recentProjects = [];
    try {
      recentProjects = JSON.parse(content);
    } catch {
      return;
    }

    recentProjects = recentProjects.filter((p: { filePath: string }) => p.filePath !== path);

    await writeTextFile(recentProjectsPath, JSON.stringify(recentProjects, null, 2));
  } catch (error) {
    console.error('Failed to remove recent project:', error);
  }
}

    const existingIndex = recentProjects.findIndex((p: any) => p.projectUUID === id);
    const newEntry = {
      fileName: name,
      filePath: path,
      openedAt: new Date().toISOString(),
      projectUUID: id,
      isTemporary: false
    };
    
    if (existingIndex >= 0) {
      recentProjects[existingIndex] = newEntry;
    } else {
      recentProjects.push(newEntry);
    }
    
    // 限制最多保留 10 筆記錄
    if (recentProjects.length > 10) {
      recentProjects = recentProjects.slice(-10);
    }
    
    // 儲存更新後的列表
    await writeTextFile(recentProjectsPath, JSON.stringify(recentProjects, null, 2));
  } catch (error) {
    console.error('Failed to update recent projects:', error);
  }
}

// 檢查是否有崩潰恢復檔案
export async function checkCrashRecoveryFiles(): Promise<string | null> {
  try {
    const appDataDir = await appLocalDataDir();
    const backupsDir = `${appDataDir}backups`;
    
    if (!(await exists(backupsDir))) {
      return null;
    }
    
    const indexPath = `${backupsDir}/project_snap_index.json`;
    if (!(await exists(indexPath))) {
      return null;
    }
    
    const content = await readTextFile(indexPath);
    const snapshots = JSON.parse(content);
    
    // 尋找最新的崩潰恢復快照
    const crashRecoveries = snapshots.filter(
      (s: any) => s.type === 'Crash Recovery'
    ).sort(
      (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    if (crashRecoveries.length > 0) {
      return crashRecoveries[0].path;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to check crash recovery files:', error);
    return null;
  }
}