
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { addIncident } from '@/lib/firestore';
import { PlusCircle, Siren } from 'lucide-react';
import { Spinner } from '../ui/spinner';

export function AddIncidentForm() {
  const [unit, setUnit] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unit || !type || !location) {
        toast({
            title: "Missing Fields",
            description: "Please fill out Unit, Type, and Location.",
            variant: "destructive"
        })
        return;
    }
    setLoading(true);
    try {
      await addIncident({ unit, type, location, description });
      toast({
        title: "Incident Created",
        description: "The new incident has been added to the list.",
      });
      // Clear form
      setUnit('');
      setType('');
      setLocation('');
      setDescription('');
    } catch (error) {
      console.error("Failed to add incident:", error);
      toast({
        title: "Error",
        description: "Could not create the incident.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5"/>
            Create Incident
        </CardTitle>
        <CardDescription>Enter details to dispatch a new incident.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="unit">Unit</Label>
            <Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g., 2B41" disabled={loading} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <Input id="type" value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g., Traffic Stop" disabled={loading} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Main St & 1st Ave" disabled={loading} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Additional details..." disabled={loading} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Spinner size="small" /> : 'Create and Dispatch'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
