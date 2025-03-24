interface Task {
  id: string;
  phase: number;
  category: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed';
  dependencies: string[];
  assignee?: string;
  startDate?: Date;
  completedDate?: Date;
}

interface Phase {
  number: number;
  name: string;
  tasks: Task[];
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'in-progress' | 'completed';
}

class TaskTracker {
  private phases: Phase[] = [];

  addPhase(phase: Omit<Phase, 'status'>) {
    this.phases.push({
      ...phase,
      status: 'pending'
    });
  }

  updateTaskStatus(phaseNumber: number, taskId: string, status: Task['status']) {
    const phase = this.phases.find(p => p.number === phaseNumber);
    if (!phase) return;

    const task = phase.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.status = status;
    
    if (status === 'completed') {
      task.completedDate = new Date();
    }

    this.updatePhaseStatus(phase);
  }

  private updatePhaseStatus(phase: Phase) {
    const allCompleted = phase.tasks.every(t => t.status === 'completed');
    const anyInProgress = phase.tasks.some(t => t.status === 'in-progress');

    if (allCompleted) {
      phase.status = 'completed';
    } else if (anyInProgress) {
      phase.status = 'in-progress';
    }
  }

  getProgress(): { phase: number; completed: number; total: number }[] {
    return this.phases.map(phase => ({
      phase: phase.number,
      completed: phase.tasks.filter(t => t.status === 'completed').length,
      total: phase.tasks.length
    }));
  }
}