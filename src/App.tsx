import { useReducer, type Dispatch } from 'react'
import { taskReducer, initialState, type Task, type Action } from './taskReducer'
import { FILTERS, filterTasks, countByFilter, type Filter } from './filter'
import TaskRow from './TaskRow'

const FILTER_LABELS: Record<Filter, string> = {
  all: 'All',
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
}

function AddForm({ dispatch }: { dispatch: Dispatch<Action> }) {
  function addTask(formData: FormData) {
    const title = String(formData.get('title') ?? '').trim()
    if (title) dispatch({ type: 'add', id: crypto.randomUUID(), title })
  }
  return (
    <form action={addTask} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      <input name="title" placeholder="New task" />
      <button type="submit">Add</button>
    </form>
  )
}

function FilterBar({
  currentFilter,
  counts,
  canUndo,
  dispatch,
}: {
  currentFilter: Filter
  counts: Record<Filter, number>
  canUndo: boolean
  dispatch: Dispatch<Action>
}) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
      {FILTERS.map((f) => {
        const isActive = currentFilter === f
        return (
          <button
            key={f}
            type="button"
            aria-pressed={isActive}
            onClick={() => dispatch({ type: 'setFilter', filter: f })}
            style={{
              fontWeight: isActive ? 'bold' : 'normal',
              backgroundColor: isActive ? '#333' : '#f0f0f0',
              color: isActive ? '#fff' : '#000',
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: '4px 10px',
              cursor: 'pointer',
            }}
          >
            {FILTER_LABELS[f]} ({counts[f]})
          </button>
        )
      })}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <button
          type="button"
          disabled={!canUndo}
          onClick={() => dispatch({ type: 'undo' })}
          style={{
            padding: '4px 10px',
            cursor: !canUndo ? 'not-allowed' : 'pointer',
          }}
        >
          Undo
        </button>
        <button
          type="button"
          disabled={counts.done === 0}
          onClick={() => dispatch({ type: 'clearDone' })}
          style={{
            padding: '4px 10px',
            cursor: counts.done === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          Clear done
        </button>
      </div>
    </div>
  )
}

function TaskList({ tasks, dispatch }: { tasks: Task[]; dispatch: Dispatch<Action> }) {
  if (tasks.length === 0) {
    return <p>No tasks here.</p>
  }

  return (
    <ul>
      {tasks.map((t) => (
        <TaskRow
          key={t.id}
          task={t}
          onNext={() => dispatch({ type: 'advance', id: t.id })}
          onDelete={() => dispatch({ type: 'remove', id: t.id })}
        />
      ))}
    </ul>
  )
}

export default function App() {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  // R6: Derived state (render sırasında hesaplanır, state'te tutulmaz)
  const visibleTasks = filterTasks(state.tasks, state.filter)
  const counts = countByFilter(state.tasks)

  return (
    <main style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Task Manager</h1>
      <AddForm dispatch={dispatch} />
      <FilterBar
        currentFilter={state.filter}
        counts={counts}
        canUndo={state.past.length > 0}
        dispatch={dispatch}
      />
      <TaskList tasks={visibleTasks} dispatch={dispatch} />
    </main>
  )
}