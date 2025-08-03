'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send } from 'lucide-react';
import { getComms, addComm } from '@/lib/firestore';
import type { Comm } from '@/types';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export function SecureComms() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comms, setComms] = useState<Comm[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = getComms((data) => {
      setComms(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [comms]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    setIsSending(true);
    try {
      await addComm({
        unit: user.name, // Or a specific unit ID if available
        message: newMessage,
      });
      setNewMessage('');
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Could not send message.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Secure Comms
        </CardTitle>
        <CardDescription>Encrypted communication channel.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col min-h-0">
        <ScrollArea className="flex-grow pr-4 -mr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-6 w-3/4" />
                    </div>
                ))
            ) : comms.length > 0 ? (
              comms.map((comm) => (
                <div key={comm.id} className="flex flex-col">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-primary">{comm.unit}</span>
                    {comm.timestamp && (
                      <span className="text-xs text-muted-foreground">
                        {format(comm.timestamp.toDate(), 'HH:mm:ss')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm">{comm.message}</p>
                </div>
              ))
            ) : (
                <div className="text-center text-muted-foreground py-8">No communications yet.</div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center space-x-2">
            <Input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isSending}
            />
            <Button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
                <Send className="h-4 w-4" />
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
