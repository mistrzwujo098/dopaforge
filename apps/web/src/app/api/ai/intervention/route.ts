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
    const rateLimitResult = await rateLimiters.ai.check(clientId, 'ai-intervention');
    
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
        { endpoint: 'ai-intervention' }
      );
      return NextResponse.json({ error: safeError.message }, { status: safeError.statusCode });
    }

    // Parse request body
    const { currentState } = await request.json();
    
    if (!currentState) {
      return NextResponse.json({ error: 'Current state required' }, { status: 400 });
    }

    // Initialize Gemini client on server side only
    const gemini = new GoogleGenerativeAI(apiKey);
    const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
Jesteś ekspertem od produktywności i psychologii motywacji.

Stan użytkownika:
- Obecne zadanie: ${currentState.taskTitle}
- Czas pracy: ${currentState.timeSpentMinutes} minut
- Procent ukończenia dzisiaj: ${currentState.completionRate}%
- Nastrój: ${currentState.recentMood || 'nieznany'}

Na podstawie stanu użytkownika, zasugeruj interwencję motywacyjną.

Odpowiedz TYLKO w formacie JSON:
{
  "interventionType": "encouragement|break|reward|challenge",
  "message": "Krótka, motywująca wiadomość (max 2 zdania)",
  "action": "Konkretna akcja do wykonania",
  "urgency": "low|medium|high"
}

Typy interwencji:
- encouragement: zachęta gdy użytkownik dobrze sobie radzi
- break: sugestia przerwy gdy pracuje zbyt długo
- reward: nagroda za postępy
- challenge: wyzwanie gdy użytkownik potrzebuje dodatkowej motywacji
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }
    
    const intervention = JSON.parse(jsonMatch[0]);
    
    return NextResponse.json(
      intervention,
      { headers: getRateLimitHeaders(rateLimitResult, 20) }
    );
  } catch (error) {
    const safeError = createSafeErrorResponse(error, 500, {
      endpoint: 'ai-intervention',
      method: 'POST'
    });
    
    return NextResponse.json(
      { error: safeError.message },
      { status: safeError.statusCode }
    );
  }
}