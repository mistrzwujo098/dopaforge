import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase-server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getRateLimiters, getClientIdentifier, getRateLimitHeaders } from '../../../../lib/api/distributed-rate-limiter';
import { createSafeErrorResponse } from '../../../../lib/error-handling';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting
    const rateLimiters = await getRateLimiters();
    const clientId = user.id || getClientIdentifier(request);
    const rateLimitResult = await rateLimiters.ai.check(clientId, 'ai-breakdown');
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult, 20)
        }
      );
    }

    // Get API key from server environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const safeError = createSafeErrorResponse(
        new Error('Missing GEMINI_API_KEY environment variable'),
        500,
        { endpoint: 'ai-breakdown' }
      );
      return NextResponse.json({ error: safeError.message }, { status: safeError.statusCode });
    }

    // Parse request body
    const { taskDescription, userContext } = await request.json();
    
    if (!taskDescription) {
      return NextResponse.json({ error: 'Task description required' }, { status: 400 });
    }

    // Initialize Gemini client on server side only
    const gemini = new GoogleGenerativeAI(apiKey);
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }
    
    const tasks = JSON.parse(jsonMatch[0]);
    
    return NextResponse.json(
      { tasks },
      { headers: getRateLimitHeaders(rateLimitResult, 20) }
    );
  } catch (error) {
    const safeError = createSafeErrorResponse(error, 500, {
      endpoint: 'ai-breakdown',
      method: 'POST'
    });
    
    return NextResponse.json(
      { error: safeError.message },
      { status: safeError.statusCode }
    );
  }
}