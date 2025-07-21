
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  SuggestMenuItemInput,
  SuggestMenuItemOutput,
  suggestMenuItem,
} from '@/ai/flows/menu-suggestion-flow';
import { BrainCircuit } from 'lucide-react';

export default function AiDemoPage() {
  const [theme, setTheme] = useState('');
  const [suggestion, setSuggestion] = useState<SuggestMenuItemOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme) return;

    setIsLoading(true);
    setSuggestion(null);
    setError(null);

    try {
      const input: SuggestMenuItemInput = { theme };
      const result = await suggestMenuItem(input);
      setSuggestion(result);
    } catch (err) {
      console.error(err);
      setError('Sorry, something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <BrainCircuit className="text-primary" />
            AI Menu Suggester
          </CardTitle>
          <CardDescription>
            Enter a restaurant theme and let AI suggest a creative menu item.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="theme">Restaurant Theme</Label>
              <Input
                id="theme"
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g., 'Seafood', 'Vegan Fusion', 'Cosmic Diner'"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <Button type="submit" disabled={isLoading || !theme} className="w-full">
              {isLoading ? 'Thinking...' : 'Get Suggestion'}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardFooter>
        </form>
        {suggestion && (
          <CardContent>
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>{suggestion.itemName}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{suggestion.description}</p>
              </CardContent>
            </Card>
          </CardContent>
        )}
      </Card>
       <footer className="text-center text-muted-foreground mt-8 text-sm">
          <p>DFS Time Tracker | © {new Date().getFullYear()}</p>
        </footer>
    </div>
  );
}
