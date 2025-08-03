
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database, User, Car, Search, ChevronsRight, Shield, FileText } from 'lucide-react';
import { searchIndividuals, searchVehicles, getVehiclesByOwner } from '@/lib/firestore';
import type { Individual, Vehicle } from '@/types';
import { Badge } from '../ui/badge';
import { Spinner } from '../ui/spinner';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible';

export function RecordsSearch() {
  const [query, setQuery] = useState('');
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expandedIndividual, setExpandedIndividual] = useState<string | null>(null);
  const [associatedVehicles, setAssociatedVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    setExpandedIndividual(null);
    setAssociatedVehicles([]);
    try {
        const [indResults, vehResults] = await Promise.all([
            searchIndividuals(query),
            searchVehicles(query),
        ]);
        setIndividuals(indResults);
        setVehicles(vehResults);
    } catch (e) {
        console.error(e)
    } finally {
        setLoading(false);
    }
  };

  const handleIndividualToggle = async (individualId: string, individualName: string) => {
    if (expandedIndividual === individualId) {
      setExpandedIndividual(null);
      setAssociatedVehicles([]);
    } else {
      setExpandedIndividual(individualId);
      setLoadingVehicles(true);
      const vehicles = await getVehiclesByOwner(individualName);
      setAssociatedVehicles(vehicles);
      setLoadingVehicles(false);
    }
  };
  
  const getLicenseStatusVariant = (status: Individual['license_status']): 'default' | 'destructive' | 'secondary' => {
      switch (status) {
          case 'Valid': return 'default';
          case 'Suspended': return 'destructive';
          case 'Expired': return 'secondary';
          default: return 'secondary';
      }
  };

  const getRegistrationStatusVariant = (status: Vehicle['registration_status']): 'default' | 'secondary' => {
    switch (status) {
        case 'Valid': return 'default';
        case 'Expired': return 'secondary';
        default: return 'secondary';
    }
};

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Records Search
        </CardTitle>
        <CardDescription>Search for individuals or vehicles by name or plate.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <div className="flex w-full items-center space-x-2 mb-4">
          <Input 
            type="text" 
            placeholder="Search name or license plate..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? <Spinner size="small"/> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        <Tabs defaultValue="individuals" className="flex-grow flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individuals"><User className="h-4 w-4 mr-2"/>Individuals ({individuals.length})</TabsTrigger>
            <TabsTrigger value="vehicles"><Car className="h-4 w-4 mr-2"/>Vehicles ({vehicles.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="individuals" className="flex-grow mt-4">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[24px]"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead>License</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-center"><Spinner/></TableCell></TableRow>
                  ) : individuals.length > 0 ? (
                    individuals.map(ind => (
                      <Collapsible asChild key={ind.id} open={expandedIndividual === ind.id} onOpenChange={() => handleIndividualToggle(ind.id, ind.name)}>
                        <>
                          <TableRow className="cursor-pointer">
                            <TableCell>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <ChevronsRight className={`h-4 w-4 transition-transform ${expandedIndividual === ind.id ? 'rotate-90' : ''}`} />
                                    </Button>
                                </CollapsibleTrigger>
                            </TableCell>
                            <TableCell>{ind.name}</TableCell>
                            <TableCell>{ind.dob}</TableCell>
                            <TableCell><Badge variant={getLicenseStatusVariant(ind.license_status)}>{ind.license_status}</Badge></TableCell>
                          </TableRow>
                          <CollapsibleContent asChild>
                            <tr>
                                <td colSpan={4} className="p-0">
                                    <div className="p-4 bg-muted/50 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <h4 className="font-semibold text-xs text-muted-foreground mb-1">ADDRESS</h4>
                                                <p className="text-sm">{ind.address}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-xs text-muted-foreground mb-1">GUN LICENSE</h4>
                                                <p className="text-sm">{ind.gunLicenseStatus || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-xs text-muted-foreground mb-1">INSURANCE</h4>
                                                <p className="text-sm">{ind.insuranceStatus || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-xs text-muted-foreground mb-2">REGISTERED FIREARMS</h4>
                                            {ind.guns && ind.guns.length > 0 ? (
                                                <ul className="list-disc list-inside text-sm space-y-1">
                                                    {ind.guns.map((gun, i) => <li key={i}>{gun}</li>)}
                                                </ul>
                                            ) : <p className="text-sm text-muted-foreground">None on record.</p>}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-xs text-muted-foreground mb-2">ASSOCIATED VEHICLES</h4>
                                            {loadingVehicles ? <Spinner size="small" /> : associatedVehicles.length > 0 ? (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Plate</TableHead>
                                                            <TableHead>Model</TableHead>
                                                            <TableHead>Registration</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {associatedVehicles.map(v => (
                                                            <TableRow key={v.id}>
                                                                <TableCell>{v.plate}</TableCell>
                                                                <TableCell>{v.model}</TableCell>
                                                                <TableCell><Badge variant={getRegistrationStatusVariant(v.registration_status)}>{v.registration_status}</Badge></TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            ) : <p className="text-sm text-muted-foreground">No vehicles on record.</p>}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                          </CollapsibleContent>
                        </>
                      </Collapsible>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={4} className="text-center">{searched ? 'No results found for individuals' : 'Enter a query to search'}</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="vehicles" className="flex-grow mt-4">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plate</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Registration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                     <TableRow><TableCell colSpan={4} className="text-center"><Spinner/></TableCell></TableRow>
                  ) : vehicles.length > 0 ? (
                    vehicles.map(veh => (
                      <TableRow key={veh.id}>
                        <TableCell>{veh.plate}</TableCell>
                        <TableCell>{veh.model}</TableCell>
                        <TableCell>{veh.owner}</TableCell>
                        <TableCell><Badge variant={getRegistrationStatusVariant(veh.registration_status)}>{veh.registration_status}</Badge></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={4} className="text-center">{searched ? 'No results found for vehicles' : 'Enter a query to search'}</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
