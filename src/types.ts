export type TaskFilter = 'all' | 'done' | 'todo' | 'high';
export type Priority = 'high' | 'medium' | 'low' | null;

export interface Task {
  id: string;
  title: string;
  done: boolean;
  dueDate?: string;
  priority: Priority;
  estimatedMinutes: number | null;
  aiAnalyzed: boolean;
}
