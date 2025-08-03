
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { addIncident } from '@/lib/firestore';
import { Megaphone, Send } from 'lucide-react';
import { Spinner } from '../ui/spinner';

const reportSchema = z.object({
  type: z.string().min(1, 'Please select an incident type.'),
  location: z.string().min(3, 'Location is required.'),
  description: z.string().min(10, 'Please provide a detailed description.'),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export function CivilianReport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      type: '',
      location: '',
      description: '',
    },
  });

  const onSubmit: SubmitHandler<ReportFormValues> = async (data) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit a report.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await addIncident({
        ...data,
        unit: user.name, // Report is from a civilian user
      });
      toast({
        title: 'Report Submitted',
        description: 'Thank you. Your report has been sent to dispatch.',
      });
      form.reset();
    } catch (error) {
      console.error('Failed to submit report:', error);
      toast({
        title: 'Submission Failed',
        description: 'Could not submit your report. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Report an Incident
        </CardTitle>
        <CardDescription>
          Use this form to report an incident. Provide as much detail as possible.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incident Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an incident type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Suspicious Activity">Suspicious Activity</SelectItem>
                      <SelectItem value="Traffic Complaint">Traffic Complaint</SelectItem>
                      <SelectItem value="Noise Complaint">Noise Complaint</SelectItem>
                      <SelectItem value="Minor Accident">Minor Accident</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Corner of Main St & 1st Ave" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the incident in detail. Include descriptions of people, vehicles, and direction of travel if applicable."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="small" /> : <Send className="mr-2 h-4 w-4" />}
              Submit Report
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
