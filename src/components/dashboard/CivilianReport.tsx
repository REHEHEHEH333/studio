
'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { addIncident, getIncidentsByReporter } from '@/lib/firestore';
import { Megaphone, Send, History } from 'lucide-react';
import { Spinner } from '../ui/spinner';
import type { Incident } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '../ui/separator';

const reportSchema = z.object({
  type: z.string().min(1, 'Incident type is required.'),
  location: z.string().min(3, 'Location is required.'),
  description: z.string().min(10, 'Please provide a detailed description.'),
});

type ReportFormValues = z.infer<typeof reportSchema>;

function MyReports() {
    const { user } = useAuth();
    const [reports, setReports] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = getIncidentsByReporter(user.uid, (data) => {
            setReports(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);
    
    const getStatusVariant = (status: Incident['status']): 'destructive' | 'secondary' | 'default' => {
        switch (status) {
            case 'Active': return 'destructive';
            case 'Pending': return 'default';
            case 'Resolved': return 'secondary';
            default: return 'secondary';
        }
    };


    return (
        <div className="mt-8">
            <Separator />
            <div className="pt-8">
                <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                    <History className="h-5 w-5" />
                    My Submitted Reports
                </h3>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={4} className="text-center py-8"><Spinner /></TableCell></TableRow>
                                ) : reports.length > 0 ? (
                                    reports.map((report) => (
                                        <TableRow key={report.id}>
                                            <TableCell>{report.type}</TableCell>
                                            <TableCell>{report.location}</TableCell>
                                            <TableCell><Badge variant={getStatusVariant(report.status)}>{report.status}</Badge></TableCell>
                                            <TableCell>{formatDistanceToNow(report.timestamp.toDate(), { addSuffix: true })}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={4} className="text-center py-8">You have not submitted any reports.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}


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
        reporterId: user.uid,
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
    <div>
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
                        <FormControl>
                            <Input placeholder="e.g., Suspicious Activity, Traffic Complaint" {...field} />
                        </FormControl>
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
        <MyReports />
    </div>
  );
}

    