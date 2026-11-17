// Hanzade Demirtaş - 2024502165
import type { Filter } from './filter'

export type Status = 'todo' | 'in-progress' | 'done'
export type Task = { id: string; title: string; status: Status }

// R1 + Bonus 1: State artık görevleri, aktif filtreyi ve geçmiş görev listelerini (past) tutuyor
export type State = {
  tasks: Task[]
  filter: Filter
  past: Task[][]
}

export const initialState: State = {
  tasks: [],
  filter: 'all',
  past: [],
}

// R2 + Bonus 1: Undo aksiyonu eklendi
export type Action =
  | { type: 'add'; id: string; title: string }
  | { type: 'advance'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'setFilter'; filter: Filter }
  | { type: 'clearDone' }
  | { type: 'undo' }

const NEXT: Record<Status, Status> = {
  todo: 'in-progress',
  'in-progress': 'done',
  done: 'todo',
}

export function taskReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        past: [...state.past, state.tasks],
        tasks: [...state.tasks, { id: action.id, title: action.title, status: 'todo' }],
      }
    case 'advance':
      return {
        ...state,
        past: [...state.past, state.tasks],
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, status: NEXT[t.status] } : t,
        ),
      }
    case 'remove':
      return {
        ...state,
        past: [...state.past, state.tasks],
        tasks: state.tasks.filter((t) => t.id !== action.id),
      }
    case 'setFilter':
      // Filtre değişikliği geri alınamaz (past değişmez)
      return {
        ...state,
        filter: action.filter,
      }
    case 'clearDone':
      return {
        ...state,
        past: [...state.past, state.tasks],
        tasks: state.tasks.filter((t) => t.status !== 'done'),
      }
    case 'undo': {
      if (state.past.length === 0) return state
      const previousTasks = state.past[state.past.length - 1]
      const newPast = state.past.slice(0, -1)
      return {
        ...state,
        tasks: previousTasks,
        past: newPast,
      }
    }
  }
}