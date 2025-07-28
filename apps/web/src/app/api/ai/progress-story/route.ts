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
    const rateLimitResult = await rateLimiters.ai.check(clientId, 'ai-story');
    
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
        { endpoint: 'ai-story' }
      );
      return NextResponse.json({ error: safeError.message }, { status: safeError.statusCode });
    }

    // Parse request body
    const { completedTasks, period } = await request.json();
    
    if (!completedTasks || completedTasks.length === 0) {
      return NextResponse.json({ 
        story: "Nie masz jeszcze ukończonych zadań. Zacznij od pierwszego małego kroku!" 
      });
    }

    // Initialize Gemini client on server side only
    const gemini = new GoogleGenerativeAI(apiKey);
    const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const totalMinutes = completedTasks.reduce((sum: number, task: any) => sum + task.estimatedMinutes, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    
    const prompt = `
Jesteś motywującym narratorem pomagającym użytkownikom celebrować ich postępy.

Ukończone zadania (${period === 'weekly' ? 'w tym tygodniu' : 'dzisiaj'}):
${completedTasks.map((t: any) => `- ${t.title} (${t.estimatedMinutes} min)`).join('\n')}

Łączny czas pracy: ${totalHours > 0 ? `${totalHours}h ${remainingMinutes}min` : `${remainingMinutes} min`}
Liczba zadań: ${completedTasks.length}

Napisz krótką (2-3 zdania), motywującą historię o postępach użytkownika.
Użyj metafor gamingowych lub przygodowych.
Bądź konkretny i odnieś się do liczby zadań i czasu.
Zakończ zachętą do dalszej pracy.

NIE używaj emoji.
NIE pisz więcej niż 3 zdania.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const story = response.text().trim();
    
    return NextResponse.json(
      { story },
      { headers: getRateLimitHeaders(rateLimitResult, 20) }
    );
  } catch (error) {
    const safeError = createSafeErrorResponse(error, 500, {
      endpoint: 'ai-story',
      method: 'POST'
    });
    
    return NextResponse.json(
      { error: safeError.message },
      { status: safeError.statusCode }
    );
  }
}