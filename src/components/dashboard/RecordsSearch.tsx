
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database, User, Car, Search } from 'lucide-react';
import { searchIndividuals, searchVehicles } from '@/lib/firestore';
import type { Individual, Vehicle } from '@/types';
import { Badge } from '../ui/badge';
import { Spinner } from '../ui/spinner';

export function RecordsSearch() {
  const [query, setQuery] = useState('');
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
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
                    <TableHead>Name</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead>License</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={3} className="text-center"><Spinner/></TableCell></TableRow>
                  ) : individuals.length > 0 ? (
                    individuals.map(ind => (
                        <TableRow key={ind.id}>
                            <TableCell>{ind.name}</TableCell>
                            <TableCell>{ind.dob}</TableCell>
                            <TableCell><Badge variant={getLicenseStatusVariant(ind.license_status)}>{ind.license_status}</Badge></TableCell>
                        </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={3} className="text-center">{searched ? 'No results found for individuals' : 'Enter a query to search'}</TableCell></TableRow>
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
