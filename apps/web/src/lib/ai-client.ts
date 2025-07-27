'use client';

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
let geminiClient: GoogleGenerativeAI | null = null;

export function getGeminiClient() {
  if (geminiClient) return geminiClient;
  
  // Try environment variable first
  let apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  // Fallback to localStorage for development
  if (!apiKey && typeof window !== 'undefined') {
    apiKey = localStorage.getItem('GEMINI_API_KEY') || '';
  }
  
  if (!apiKey) {
    console.error('Missing NEXT_PUBLIC_GEMINI_API_KEY');
    return null;
  }
  
  geminiClient = new GoogleGenerativeAI(apiKey);
  return geminiClient;
}

// Task breakdown function
export async function breakdownTask(taskDescription: string, userContext?: {
  energyLevel?: 'low' | 'medium' | 'high';
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  availableTime?: number; // in minutes
}) {
  const gemini = getGeminiClient();
  if (!gemini) {
    throw new Error('AI service not configured');
  }

  const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const prompt = `
You are a productivity expert specializing in breaking down complex tasks into micro-tasks.
Each micro-task should take between 2-25 minutes to complete.

Task to break down: "${taskDescription}"

User context:
- Energy level: ${userContext?.energyLevel || 'medium'}
- Experience level: ${userContext?.experienceLevel || 'intermediate'}
- Available time: ${userContext?.availableTime || 'flexible'} minutes

Please break this down into specific, actionable micro-tasks.
Format your response as a JSON array with this structure:
[
  {
    "title": "Task title",
    "estimatedMinutes": 15,
    "difficulty": "easy|medium|hard",
    "description": "Brief description of what to do",
    "order": 1
  }
]

Rules:
1. Each task must be 2-25 minutes
2. Tasks should be concrete and actionable
3. Order tasks logically
4. Consider user's energy and experience level
5. Make the first task very easy to build momentum
6. Return ONLY valid JSON, no other text
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }
    
    const tasks = JSON.parse(jsonMatch[0]);
    return tasks;
  } catch (error) {
    console.error('Error breaking down task:', error);
    throw new Error('Failed to break down task');
  }
}

// Progress storytelling function
export async function generateProgressStory(completedTasks: Array<{
  title: string;
  completedAt: Date;
  estimatedMinutes: number;
}>, period: 'daily' | 'weekly' = 'daily') {
  const gemini = getGeminiClient();
  if (!gemini) {
    throw new Error('AI service not configured');
  }

  const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const tasksDescription = completedTasks.map(t => 
    `- "${t.title}" (${t.estimatedMinutes} min)`
  ).join('\n');

  const prompt = `
You are a motivational storyteller for a productivity app called DopaForge.
Create an epic ${period} recap story based on these completed tasks:

${tasksDescription}

Total time invested: ${completedTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0)} minutes

Create a short (3-4 sentences) heroic narrative that:
1. Makes the user feel like a hero
2. Uses gaming/RPG metaphors
3. Highlights their achievements
4. Motivates them to continue
5. Mentions specific tasks they completed

Keep it enthusiastic but not cheesy. Write in second person ("you").
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating story:', error);
    throw new Error('Failed to generate progress story');
  }
}

// Emotion-based intervention suggestions
export async function getEmotionBasedIntervention(
  currentState: {
    taskTitle: string;
    timeSpentMinutes: number;
    completionRate: number;
    recentMood?: string;
  }
) {
  const gemini = getGeminiClient();
  if (!gemini) {
    throw new Error('AI service not configured');
  }

  const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const prompt = `
You are an empathetic productivity coach. Based on the user's current state, suggest an appropriate intervention.

Current situation:
- Working on: "${currentState.taskTitle}"
- Time spent: ${currentState.timeSpentMinutes} minutes
- Today's completion rate: ${currentState.completionRate}%
- Mood indicators: ${currentState.recentMood || 'neutral'}

Suggest ONE intervention from these types:
1. Encouraging message
2. Break suggestion with specific activity
3. Task simplification advice
4. Energy boost technique
5. Compassionate reality check

Return a JSON object:
{
  "type": "intervention type",
  "message": "Specific, actionable message",
  "duration": "suggested duration in minutes",
  "followUp": "What to do after"
}

Be specific, warm, and actionable. Avoid generic advice.
Return ONLY valid JSON.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error getting intervention:', error);
    throw new Error('Failed to get intervention suggestion');
  }
}

// Task priority advisor
export async function getTaskPriorityAdvice(tasks: Array<{
  id: string;
  title: string;
  estimatedMinutes: number;
  deadline?: Date;
  importance?: 'low' | 'medium' | 'high';
  energy?: 'low' | 'medium' | 'high';
}>, currentTime: Date, userEnergy: 'low' | 'medium' | 'high') {
  const gemini = getGeminiClient();
  if (!gemini) {
    throw new Error('AI service not configured');
  }

  const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const tasksDescription = tasks.map(t => ({
    id: t.id,
    title: t.title,
    minutes: t.estimatedMinutes,
    deadline: t.deadline ? t.deadline.toISOString() : 'none',
    importance: t.importance || 'medium',
    energyRequired: t.energy || 'medium'
  }));

  const prompt = `
You are a task prioritization expert. Help the user decide what to work on next.

Current time: ${currentTime.toISOString()}
User's energy level: ${userEnergy}

Tasks to prioritize:
${JSON.stringify(tasksDescription, null, 2)}

Consider:
1. Deadlines and urgency
2. User's current energy vs task requirements
3. Task importance
4. Building momentum (easy wins when energy is low)
5. Time of day effectiveness

Return a JSON object:
{
  "recommendedTaskId": "id of the best task to do now",
  "reasoning": "Brief explanation why this task now",
  "alternativeTaskId": "backup option",
  "energyTip": "How to manage energy for this task"
}

Return ONLY valid JSON.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error getting priority advice:', error);
    throw new Error('Failed to get priority advice');
  }
}