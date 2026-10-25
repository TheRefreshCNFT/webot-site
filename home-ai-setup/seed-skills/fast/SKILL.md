---
name: fast
description: Execute a trivial home-AI task inline with no planning overhead
type: prompt
whenToUse: When the user asks for a quick, one-step task that can be done in under two minutes
---

# Fast

Execute the user’s request directly in the current session. Do not spawn subagents and do not write a plan file.

Use this for:

- Answering a short question about the home AI setup.
- Editing a single config file.
- Listing files or reading a note.
- Running a one-line command and summarizing the output.

If the task is larger than one or two steps, stop and suggest breaking it into a proper plan or using the harness’s normal workflow.
