import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseBrowser } from '@/lib/supabase-browser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userEmail, type, message, metadata } = body;

    if (!userId || !type || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a production app, you would store this in a database
    // For now, we'll log it and potentially send it to an external service
    const feedback = {
      id: crypto.randomUUID(),
      user_id: userId,
      user_email: userEmail,
      type,
      message,
      metadata,
      created_at: new Date().toISOString(),
    };

    // Here you could:
    // 1. Store in Supabase feedback table
    // 2. Send to a service like Sentry, LogRocket, etc.
    // 3. Send email notification to admin
    // 4. Store in a feedback tracking system

    console.log('Feedback received:', feedback);

    // If you have a Supabase feedback table:
    // const supabase = createSupabaseBrowser();
    // const { error } = await supabase
    //   .from('feedback')
    //   .insert(feedback);
    // 
    // if (error) throw error;

    return NextResponse.json({ success: true, id: feedback.id });
  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}