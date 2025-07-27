'use client';

// Client-side AI functions that call server-side API routes
// No API keys are stored or used on the client side

// Task breakdown function - calls server-side API
export async function breakdownTask(taskDescription: string, userContext?: {
  energyLevel?: 'low' | 'medium' | 'high';
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  availableTime?: number; // in minutes
}) {
  try {
    const response = await fetch('/api/ai/breakdown', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskDescription, userContext }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to break down task');
    }

    const { tasks } = await response.json();
    return tasks;
  } catch (error) {
    console.error('Error breaking down task:', error);
    throw error;
  }
}

// Progress storytelling function - calls server-side API
export async function generateProgressStory(completedTasks: Array<{
  title: string;
  completedAt: Date;
  estimatedMinutes: number;
}>, period: 'daily' | 'weekly' = 'daily') {
  try {
    const response = await fetch('/api/ai/progress-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completedTasks, period }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate story');
    }

    const { story } = await response.json();
    return story;
  } catch (error) {
    console.error('Error generating story:', error);
    throw error;
  }
}

// Emotion-based intervention suggestions - calls server-side API
export async function getEmotionBasedIntervention(
  currentState: {
    taskTitle: string;
    timeSpentMinutes: number;
    completionRate: number;
    recentMood?: string;
  }
) {
  try {
    const response = await fetch('/api/ai/intervention', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentState }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get intervention');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting intervention:', error);
    throw error;
  }
}

// Task priority advisor - calls server-side API
export async function getTaskPriorityAdvice(tasks: Array<{
  id: string;
  title: string;
  estimatedMinutes: number;
  deadline?: Date;
  importance?: 'low' | 'medium' | 'high';
  energy?: 'low' | 'medium' | 'high';
}>, currentTime: Date, userEnergy: 'low' | 'medium' | 'high') {
  try {
    const response = await fetch('/api/ai/priority-advice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tasks, currentTime, userEnergy }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get priority advice');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting priority advice:', error);
    throw error;
  }
}