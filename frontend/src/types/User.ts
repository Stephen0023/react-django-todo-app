export type UUID = ReturnType<typeof crypto.randomUUID>;

export type DarkModeOptions = "system" | "auto" | "light" | "dark";

export interface User {
  name: string | null;
  createdAt: Date;
  tasks: Task[];
  categories: Category[];
  colorList: string[];
  theme: string;
  darkmode: DarkModeOptions;
}

export interface Task {
  id: UUID;
  done: boolean;
  pinned: boolean;
  name: string;
  completed: boolean;
  description?: string;
  emoji?: string;
  color: string;
  date: Date;
  deadline?: Date;
  category?: Category[];
  lastSave?: Date;
  sharedBy?: string;
}

export interface Category {
  id: UUID;
  name: string;
  emoji?: string;
  color: string;
}
