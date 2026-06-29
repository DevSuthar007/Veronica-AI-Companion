export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline: string; // ISO string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  category: 'Work' | 'Study' | 'Health' | 'Personal' | 'Other';
  scheduledTime?: string; // ISO string for calendar integration
  checklist: ChecklistItem[];
  estimatedDuration?: number; // in minutes
  reminderSent?: boolean;
}

export interface Habit {
  id: string;
  title: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  lastCompleted?: string; // Date string 'YYYY-MM-DD'
  targetCount: number;
  currentCount: number;
  category: 'Work' | 'Study' | 'Health' | 'Personal' | 'Other';
  history: { date: string; completed: boolean }[];
}

export interface VeronicaState {
  mood: 'happy' | 'neutral' | 'worried' | 'angry';
  isSpeaking: boolean;
  isListening: boolean;
  currentSubtitle: string;
  relationshipScore: number; // 0 to 100 based on completion of tasks & goals
}

export interface Message {
  id: string;
  sender: 'user' | 'veronica';
  text: string;
  timestamp: string;
  mood?: 'happy' | 'neutral' | 'worried' | 'angry';
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'action' | 'motivation' | 'warning' | 'tip';
  associatedTaskId?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}
