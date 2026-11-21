## Commits
- schema: (fix|add|chg) - description (refs #|norefs)
- if the change relates to a task from TASKS.md, use (refs #t-<task number>) instead of norefs
- commit descriptions in English; UI texts are in Russian
- a bugfix within a task is a separate commit: fix - description (refs #t-<number>)

## Tasks
- recorded in TASKS.md, template: t-<number>-short description
- description on the next line; detailed description is optional
- done tasks are marked with strikethrough
- work on exactly one task at a time; if the user starts another task, remind them of the current one
- task lifecycle: implement -> npx tsc --noEmit && npx vite build -> visual check via dev server (localhost:3000/attractors/) -> strike through in TASKS.md -> commit with refs #t-<number>
- do not close a task without the user's confirmation unless they explicitly approved it
- no drive-by refactoring: if a task requires structural changes beyond its scope (new types, moving responsibilities, changing the architecture), propose them first and wait for approval, or suggest a separate refactoring task

## Architecture
- attractor modules (src/attractors/) own everything: derivative, parameter descriptors (key, label, default, step, min), integration settings (timeSpan, dt), initial conditions
- Canvas is presentation only: no knowledge of concrete attractors or their parameters
- Controls renders parameter inputs dynamically from the descriptors of the current system
- all settings live in the zustand store (src/store.ts); Canvas reads via useSettingsStore (subscribe for rebuilds, getState() inside the animation loop)
- adding a new attractor = module file + registerX(modules) in attractors/index.ts + an <option> in the Controls select

## Project notes
- dist/ is rebuilt with vite build and served by nginx from docker-compose.yml
