export interface UndoItem {
  type: "edit-task" | "delete-task" | "assign-resource" | "create-task";
  targetId: string;
  beforeState: any;
  afterState: any;
}

export class UndoRedoManager {
  private undoStack: UndoItem[] = [];
  private redoStack: UndoItem[] = [];
  private maxStackSize: number = 50;
  
  constructor(maxStackSize: number = 50) {
    this.maxStackSize = maxStackSize;
  }
  
  public pushUndo(item: UndoItem): void {
    this.undoStack.push(item);
    
    // 限制堆疊大小
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift();
    }
    
    // 清空 redo 堆疊
    this.redoStack = [];
  }
  
  public undo(): UndoItem | null {
    if (this.undoStack.length === 0) return null;
    
    const item = this.undoStack.pop()!;
    this.redoStack.push(item);
    
    return item;
  }
  
  public redo(): UndoItem | null {
    if (this.redoStack.length === 0) return null;
    
    const item = this.redoStack.pop()!;
    this.undoStack.push(item);
    
    return item;
  }
  
  public clearUndoStack(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
  
  public hasUndoActions(): boolean {
    return this.undoStack.length > 0;
  }
  
  public hasRedoActions(): boolean {
    return this.redoStack.length > 0;
  }
}