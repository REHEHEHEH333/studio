'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare } from 'lucide-react';
import { getComms } from '@/lib/firestore';
import type { Comm } from '@/types';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

export function SecureComms() {
  const [comms, setComms] = useState<Comm[]>([]);
  const [loading, setLoading] = useState(true);
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
                    <span className="text-xs text-muted-foreground">
                      {format(comm.timestamp.toDate(), 'HH:mm:ss')}
                    </span>
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
    </Card>
  );
}
