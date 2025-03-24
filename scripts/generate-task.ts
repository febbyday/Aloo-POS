import { nanoid } from 'nanoid';

interface TaskTemplate {
  name: string;
  category: string;
  description: string;
  subtasks: string[];
}

export function generateTask(template: TaskTemplate, phase: number): Task {
  return {
    id: nanoid(),
    phase,
    category: template.category,
    name: template.name,
    status: 'pending',
    dependencies: [],
    subtasks: template.subtasks.map(subtask => ({
      id: nanoid(),
      name: subtask,
      status: 'pending'
    }))
  };
}

export function generatePhase(
  number: number,
  name: string,
  tasks: TaskTemplate[],
  durationWeeks: number
): Phase {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + (durationWeeks * 7));

  return {
    number,
    name,
    tasks: tasks.map(t => generateTask(t, number)),
    startDate,
    endDate,
    status: 'pending'
  };
}