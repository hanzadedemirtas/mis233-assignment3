import { describe, it, expect } from 'vitest'
import { taskReducer, initialState, type State } from './taskReducer'
import { filterTasks, countByFilter } from './filter'

describe('taskReducer', () => {
  it('adds a task with status todo', () => {
    const next = taskReducer(initialState, { type: 'add', id: '1', title: 'Study MIS 233' })
    expect(next.tasks).toEqual([{ id: '1', title: 'Study MIS 233', status: 'todo' }])
    expect(next.filter).toBe('all')
  })

  it('advances a task through todo -> in-progress -> done -> todo', () => {
    let state = taskReducer(initialState, { type: 'add', id: '1', title: 'Task 1' })
    state = taskReducer(state, { type: 'advance', id: '1' })
    expect(state.tasks[0].status).toBe('in-progress')

    state = taskReducer(state, { type: 'advance', id: '1' })
    expect(state.tasks[0].status).toBe('done')

    state = taskReducer(state, { type: 'advance', id: '1' })
    expect(state.tasks[0].status).toBe('todo')
  })

  it('removes a task by id and ignores unknown id', () => {
    let state = taskReducer(initialState, { type: 'add', id: '1', title: 'Task 1' })
    state = taskReducer(state, { type: 'remove', id: 'unknown-id' })
    expect(state.tasks).toHaveLength(1)

    state = taskReducer(state, { type: 'remove', id: '1' })
    expect(state.tasks).toHaveLength(0)
  })

  it('sets the filter without changing tasks', () => {
    const s1 = taskReducer(initialState, { type: 'add', id: '1', title: 'Task 1' })
    const s2 = taskReducer(s1, { type: 'setFilter', filter: 'done' })
    expect(s2.filter).toBe('done')
    expect(s2.tasks).toEqual(s1.tasks)
  })

  it('clears only done tasks and keeps filter', () => {
    let state = taskReducer(initialState, { type: 'add', id: '1', title: 'Done task' })
    state = taskReducer(state, { type: 'add', id: '2', title: 'Todo task' })
    state = taskReducer(state, { type: 'advance', id: '1' })
    state = taskReducer(state, { type: 'advance', id: '1' })
    state = taskReducer(state, { type: 'setFilter', filter: 'in-progress' })

    const cleared = taskReducer(state, { type: 'clearDone' })
    expect(cleared.tasks).toEqual([{ id: '2', title: 'Todo task', status: 'todo' }])
    expect(cleared.filter).toBe('in-progress')
  })

  it('does not mutate the previous state (tested with Object.freeze)', () => {
    const frozenState: State = Object.freeze({
      tasks: Object.freeze([{ id: '1', title: 'Immutable', status: 'todo' }]) as State['tasks'],
      filter: 'all',
      past: Object.freeze([]) as State['past'],
    })

    const next = taskReducer(frozenState, { type: 'advance', id: '1' })
    expect(frozenState.tasks[0].status).toBe('todo')
    expect(next.tasks[0].status).toBe('in-progress')
  })

  it('supports undo for task changes but not filter changes', () => {
    let state = taskReducer(initialState, { type: 'add', id: '1', title: 'Task 1' })
    state = taskReducer(state, { type: 'setFilter', filter: 'todo' })
    state = taskReducer(state, { type: 'undo' })
    // Undo should revert the 'add', leaving filter as 'todo'
    expect(state.tasks).toHaveLength(0)
    expect(state.filter).toBe('todo')

    // Undo on empty past does nothing
    const sameState = taskReducer(state, { type: 'undo' })
    expect(sameState).toBe(state)
  })
})

describe('filterTasks and countByFilter', () => {
  it('filters tasks and computes counts accurately including empty edge cases', () => {
    expect(countByFilter([])).toEqual({ all: 0, todo: 0, 'in-progress': 0, done: 0 })
    expect(filterTasks([], 'todo')).toEqual([])

    let state = taskReducer(initialState, { type: 'add', id: '1', title: 'T1' })
    state = taskReducer(state, { type: 'add', id: '2', title: 'T2' })
    state = taskReducer(state, { type: 'add', id: '3', title: 'T3' })
    state = taskReducer(state, { type: 'advance', id: '2' })
    state = taskReducer(state, { type: 'advance', id: '3' })
    state = taskReducer(state, { type: 'advance', id: '3' })

    expect(countByFilter(state.tasks)).toEqual({
      all: 3,
      todo: 1,
      'in-progress': 1,
      done: 1,
    })
    expect(filterTasks(state.tasks, 'all')).toHaveLength(3)
    expect(filterTasks(state.tasks, 'in-progress').map((t) => t.id)).toEqual(['2'])
  })
})