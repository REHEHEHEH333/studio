'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Siren, ChevronDown, ChevronRight } from 'lucide-react';
import { getIncidents, updateIncidentStatus } from '@/lib/firestore';
import type { Incident } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export function IncidentList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIncidentId, setOpenIncidentId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = getIncidents((data) => {
      setIncidents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getStatusVariant = (status: Incident['status']): 'destructive' | 'secondary' | 'default' => {
    switch (status) {
      case 'Active':
        return 'destructive';
      case 'Pending':
        return 'default';
      case 'Resolved':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const isDispatcher = user?.role === 'dispatch';

  const handleStatusChange = async (incidentId: string, status: Incident['status']) => {
    try {
      await updateIncidentStatus(incidentId, status);
      toast({
        title: "Status Updated",
        description: `Incident status changed to ${status}.`,
      });
    } catch (error) {
      console.error("Failed to update status:", error);
      toast({
        title: "Error",
        description: "Could not update incident status.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Siren className="h-5 w-5" />
          Active Incidents
        </CardTitle>
        <CardDescription>Live feed of ongoing emergency incidents.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[24px]"></TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell></TableCell>
                  <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[70px] rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                </TableRow>
              ))
            ) : (
              incidents.map((incident) => (
                <Collapsible asChild key={incident.id} open={openIncidentId === incident.id} onOpenChange={() => setOpenIncidentId(openIncidentId === incident.id ? null : incident.id)}>
                  <>
                    <TableRow className="cursor-pointer">
                      <TableCell>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            {openIncidentId === incident.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </TableCell>
                      <TableCell className="font-medium">{incident.unit}</TableCell>
                      <TableCell>{incident.type}</TableCell>
                      <TableCell>{incident.location}</TableCell>
                      <TableCell>
                        {isDispatcher ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Badge variant={getStatusVariant(incident.status)} className="cursor-pointer">{incident.status}</Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleStatusChange(incident.id, 'Pending')}>Pending</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(incident.id, 'Active')}>Active</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(incident.id, 'Resolved')}>Resolved</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Badge variant={getStatusVariant(incident.status)}>{incident.status}</Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDistanceToNow(incident.timestamp.toDate(), { addSuffix: true })}</TableCell>
                    </TableRow>
                    <CollapsibleContent asChild>
                      <tr>
                        <td colSpan={6} className="p-0">
                          <div className="p-4 bg-muted/50">
                            <h4 className="font-semibold">Description</h4>
                            <p className="text-sm text-muted-foreground">{incident.description || 'No description provided.'}</p>
                          </div>
                        </td>
                      </tr>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
