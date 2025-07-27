'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@dopaforge/ui';
import { Sparkles, ExternalLink, Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export default function SetupAIPage() {
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        title: 'API Key Required',
        description: 'Please enter your Gemini API key',
        variant: 'destructive',
      });
      return;
    }

    // In a real implementation, this would save to environment variables
    localStorage.setItem('GEMINI_API_KEY', apiKey);
    
    toast({
      title: 'API Key Saved',
      description: 'Your Gemini API key has been saved locally',
    });
  };

  const copyEnvVar = () => {
    navigator.clipboard.writeText('NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Setup AI Features
          </h1>
          <p className="text-muted-foreground">
            Configure Google Gemini to enable AI-powered productivity features
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Google Gemini API Setup</CardTitle>
            <CardDescription>
              Follow these steps to enable AI features in DopaForge
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">1. Get your Gemini API Key</h3>
                <p className="text-sm text-muted-foreground">
                  Visit Google AI Studio to create a free API key
                </p>
                <Button variant="outline" asChild>
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    Get API Key
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">2. Add to Environment Variables</h3>
                <p className="text-sm text-muted-foreground">
                  Add this to your .env.local file or Vercel environment variables:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                    NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyEnvVar}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">3. Temporary Setup (Development)</h3>
                <p className="text-sm text-muted-foreground">
                  For testing, you can temporarily store your API key locally:
                </p>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">Gemini API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your Gemini API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <Button onClick={handleSave} variant="gradient">
                    Save Temporarily
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Available AI Features:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5" />
                  <span>
                    <strong>Smart Task Breakdown:</strong> AI breaks complex tasks into 2-25 minute micro-tasks
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5" />
                  <span>
                    <strong>Progress Storytelling:</strong> AI creates motivational narratives from your completed tasks
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5" />
                  <span>
                    <strong>Emotion-Based Interventions:</strong> AI suggests personalized breaks and interventions
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5" />
                  <span>
                    <strong>Task Priority Advisor:</strong> AI recommends which task to work on based on your energy
                  </span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}