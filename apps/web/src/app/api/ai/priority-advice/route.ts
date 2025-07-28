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
    const rateLimitResult = await rateLimiters.ai.check(clientId, 'ai-priority');
    
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
        { endpoint: 'ai-priority' }
      );
      return NextResponse.json({ error: safeError.message }, { status: safeError.statusCode });
    }

    // Parse request body
    const { tasks, currentTime, userEnergy } = await request.json();
    
    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ error: 'No tasks provided' }, { status: 400 });
    }

    // Initialize Gemini client on server side only
    const gemini = new GoogleGenerativeAI(apiKey);
    const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const tasksInfo = tasks.map((t: any) => ({
      id: t.id,
      title: t.title,
      minutes: t.estimatedMinutes,
      deadline: t.deadline ? new Date(t.deadline).toLocaleDateString('pl-PL') : 'brak',
      importance: t.importance === 'high' ? 'wysoka' : t.importance === 'low' ? 'niska' : 'średnia'
    }));
    
    const prompt = `
Jesteś ekspertem produktywności pomagającym wybrać najlepsze zadanie do wykonania teraz.

Obecny czas: ${new Date(currentTime).toLocaleString('pl-PL')}
Poziom energii użytkownika: ${userEnergy === 'low' ? 'niski' : userEnergy === 'high' ? 'wysoki' : 'średni'}

Dostępne zadania:
${JSON.stringify(tasksInfo, null, 2)}

Na podstawie:
- Poziomu energii użytkownika
- Czasu trwania zadań
- Terminów wykonania
- Ważności zadań

Wybierz najlepsze zadanie do wykonania teraz i opcjonalnie alternatywę.

Odpowiedz TYLKO w formacie JSON:
{
  "recommendedTaskId": "id_zadania",
  "reasoning": "Krótkie wyjaśnienie dlaczego to zadanie jest najlepsze teraz",
  "alternativeTaskId": "id_alternatywnego_zadania",
  "energyTip": "Porada dotycząca energii i produktywności"
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }
    
    const advice = JSON.parse(jsonMatch[0]);
    
    return NextResponse.json(
      advice,
      { headers: getRateLimitHeaders(rateLimitResult, 20) }
    );
  } catch (error) {
    const safeError = createSafeErrorResponse(error, 500, {
      endpoint: 'ai-priority',
      method: 'POST'
    });
    
    return NextResponse.json(
      { error: safeError.message },
      { status: safeError.statusCode }
    );
  }
}