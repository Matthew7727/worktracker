---
description: Executes one iteration of the Ralph Loop
---

# Ralph Iteration Workflow

Goal: Advance the project by exactly one atomic step defined in the progress state.

1. **Analyze State**:
   - Read `@/progress.md`.
   - Identify the item marked `⏭️ Immediate Next Action`.

2. **Execute**:
   - Perform the task (Code + Test).
   - *Constraint:* Do not touch files unrelated to the current task.

3. **Handover**:
   - Update `@/progress.md` with the outcome.
   - If the task failed, explain WHY in the file.
   - If the task succeeded, mark it `[x]` and write the NEXT logical step in `⏭️`.

4. **Self-Correction**:
   - Did you create a new file? Add it to `@/lessons.md` so future agents know it exists.

5. **Final Output**:
   - If the project is NOT done, output exactly: `result: CONTINUE`
   - If the project IS done, output exactly: `result: STOP`