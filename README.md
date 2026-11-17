# Assignment 3: Task Manager with a Reducer

**Name:** Hanzade Demirtaş  
**Student ID:** 2024502165  

---

## Bonus 1: Undo

To undo task changes, I added a `past: Task[][]` array to the `State` object next to `tasks` and `filter`. When an action changes tasks (`add`, `advance`, `remove`, or `clearDone`), the reducer saves the old `tasks` list into `past` before making the new state. However, `setFilter` does not change `past`, so filter changes cannot be undone. When we dispatch `{ type: 'undo' }`, the reducer takes the last saved list from `past` and puts it back into `tasks`. Also, the Undo button is disabled when `past` is empty.

---

## Bonus 2: Tests

I wrote unit tests in `src/taskReducer.test.ts` using Vitest (`npm test`). The tests check all reducer actions, the three-step status change, state immutability with `Object.freeze`, the undo feature, and edge cases for `filterTasks` and `countByFilter`.

```text
> task-manager-assignment3@0.0.0 test
> vitest run

 RUN  v5.1.0 /Users/hanzadedemirtas/Desktop/assignment3

 ✓ src/taskReducer.test.ts (8 tests) 2ms
   ✓ taskReducer (7)
     ✓ adds a task with status todo 1ms
     ✓ advances a task through todo -> in-progress -> done -> todo 0ms
     ✓ removes a task by id and ignores unknown id 0ms
     ✓ sets the filter without changing tasks 0ms
     ✓ clears only done tasks and keeps filter 0ms
     ✓ does not mutate the previous state (tested with Object.freeze) 0ms
     ✓ supports undo for task changes but not filter changes 0ms
   ✓ filterTasks and countByFilter (1)
     ✓ filters tasks and computes counts accurately including empty edge cases 0ms

 Test Files  1 passed (1)
      Tests  8 passed (8)

## Bonus 3: Explain your reducer
```

A reducer must be a pure function. React checks if the state object is new or the same to update the screen. If a reducer changes the old state directly and returns it, React thinks nothing changed. Then, React does not update the screen, and features like Undo stop working. Returning new objects and arrays helps React update the screen correctly and makes fixing bugs easier.

Also, we must create IDs with `crypto.randomUUID()` inside the `AddForm`, not in the reducer. A pure function must always give the exact same result for the same inputs. If the reducer creates random IDs or times, calling it twice with the same inputs will give different results. This breaks React Strict Mode and makes testing very difficult.

We calculate `filteredTasks` and filter counts during render with `filterTasks` and `countByFilter`. We do not save them in state because we want only one source of data. If we saved them in state, bugs would happen. For example, if a user changes a task from "To do" to "In-progress", the task would still show under "To do" unless we updated the list and counts by hand every time.

Finally, putting `filter` and `tasks` together in the reducer state makes the code easy to follow and test. Now, `taskReducer` keeps all the app's logic in one clean place instead of in different hooks.

## Bonus 4: Git repository
```

https://github.com/hanzadedemirtas/mis233-assignment3