
'use client';

import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BrainCircuit, AlertTriangle, FileText, Volume2 } from 'lucide-react';
import { summarizeRadioCommunication, type SummarizeRadioCommunicationOutput } from '@/ai/flows/summarize-radio-communication';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { Spinner } from '../ui/spinner';
import { Separator } from '../ui/separator';

export function IntelFeed() {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<SummarizeRadioCommunicationOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleAnalyze = async () => {
    if (!text) return;
    setLoading(true);
    setAnalysis(null);
    try {
      const result = await summarizeRadioCommunication({ text });
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      // You can add a toast notification here for the user
    } finally {
      setLoading(false);
    }
  };

  const handleListen = async () => {
    if (!analysis?.summary) return;
    setLoadingAudio(true);
    try {
      const result = await textToSpeech({ text: analysis.summary });
      if (result.audioDataUri) {
        if (audioRef.current) {
          audioRef.current.src = result.audioDataUri;
          audioRef.current.play();
        }
      }
    } catch (error) {
      console.error('Text-to-speech failed:', error);
    } finally {
      setLoadingAudio(false);
    }
  };

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5" />
          Real-time Intel Feed
        </CardTitle>
        <CardDescription>Analyze radio communications for summaries and alerts using AI.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Paste radio communication text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[120px] font-code"
          disabled={loading}
        />
        <Button onClick={handleAnalyze} disabled={!text || loading} className="w-full sm:w-auto">
          {loading ? <Spinner size="small"/> : 'Analyze Communication'}
        </Button>
        {analysis && (
          <div className="space-y-4 pt-4">
            <Separator />
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4"/>Summary</h3>
                    <Button variant="ghost" size="icon" onClick={handleListen} disabled={loadingAudio}>
                        {loadingAudio ? <Spinner size="small"/> : <Volume2 className="h-4 w-4"/>}
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">{analysis.summary}</p>
            </div>
            {analysis.alerts && analysis.alerts.length > 0 && (
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4 text-destructive"/>Alerts</h3>
                <div className="space-y-2">
                  {analysis.alerts.map((alert, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Potential Alert</AlertTitle>
                      <AlertDescription>{alert}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <audio ref={audioRef} className="hidden" />
      </CardContent>
    </Card>
  );
}
