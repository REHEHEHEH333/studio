'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { Separator } from '../ui/separator';

interface RadioCommunication {
  summary: string;
  priority: 'low' | 'medium' | 'high';
  suggestedResponse: string;
}

export function IntelFeed() {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<RadioCommunication | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = () => {
    if (!text) return;
    setLoading(true);
    
    // Simulate analysis with a timeout
    setTimeout(() => {
      // Simple text analysis without AI
      const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
      const hasUrgent = text.toLowerCase().includes('urgent') || text.toLowerCase().includes('emergency');
      const hasAssistance = text.toLowerCase().includes('assistance') || text.toLowerCase().includes('backup');
      
      setAnalysis({
        summary: `Communication received with ${wordCount} words.`,
        priority: hasUrgent ? 'high' : hasAssistance ? 'medium' : 'low',
        suggestedResponse: hasUrgent 
          ? 'Immediate response required' 
          : hasAssistance 
            ? 'Dispatch backup if available' 
            : 'Monitor situation'
      });
      setLoading(false);
    }, 1000);
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return '';
    }
  };

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Communication Log
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter radio communication text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[120px] font-code"
          disabled={loading}
        />
        <Button 
          onClick={handleAnalyze} 
          disabled={!text || loading} 
          className="w-full sm:w-auto"
        >
          {loading ? 'Processing...' : 'Log Communication'}
        </Button>
        
        {analysis && (
          <div className="space-y-4 pt-4">
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4"/>
                  Communication Details
                </h3>
                <span className={`text-sm font-medium ${getPriorityColor(analysis.priority)}`}>
                  Priority: {analysis.priority.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{analysis.summary}</p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Suggested Response:</span> {analysis.suggestedResponse}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
