
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getAllUsers, updateUserRole, getIndividualByName, updateIndividual, getVehiclesByOwner, updateVehicle } from '@/lib/firestore';
import type { UserProfile, Individual, Vehicle } from '@/types';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, Edit, PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

function EditCivilianDialog({ user }: { user: UserProfile }) {
  const { toast } = useToast();
  const [individual, setIndividual] = useState<Individual | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [indData, vehData] = await Promise.all([
          getIndividualByName(user.name),
          getVehiclesByOwner(user.name)
        ]);
        setIndividual(indData);
        setVehicles(vehData);
      } catch (error) {
        console.error("Failed to fetch civilian data:", error);
        toast({ title: "Error", description: "Could not load civilian data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user.name, toast]);

  const handleIndividualChange = (field: keyof Individual, value: any) => {
    if (individual) {
      setIndividual({ ...individual, [field]: value });
    }
  };
  
  const handleGunChange = (index: number, value: string) => {
    if (individual) {
      const newGuns = [...individual.guns];
      newGuns[index] = value;
      handleIndividualChange('guns', newGuns);
    }
  }

  const addGun = () => {
    if(individual) {
      handleIndividualChange('guns', [...individual.guns, '']);
    }
  }

  const removeGun = (index: number) => {
    if(individual) {
      const newGuns = individual.guns.filter((_, i) => i !== index);
      handleIndividualChange('guns', newGuns);
    }
  }

  const handleVehicleChange = (index: number, field: keyof Vehicle, value: any) => {
    const newVehicles = [...vehicles];
    (newVehicles[index] as any)[field] = value;
    setVehicles(newVehicles);
  };

  const handleSaveChanges = async () => {
    try {
      if (individual) {
        await updateIndividual(individual.id, individual);
      }
      // In a real app, you'd likely have a more robust way to handle vehicle updates
      // This sequential update is for demonstration.
      for (const vehicle of vehicles) {
        await updateVehicle(vehicle.id, vehicle);
      }
      toast({ title: "Success", description: "Civilian information updated." });
    } catch (error) {
      console.error("Failed to save changes:", error);
      toast({ title: "Error", description: "Could not save changes.", variant: "destructive" });
    }
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Edit Civilian: {user.name}</DialogTitle>
        <DialogDescription>
          Modify the records for this civilian. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      {loading ? <div className="flex justify-center py-8"><Spinner /></div> : (
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
          {individual ? (
            <>
              <h4 className="font-semibold text-lg">Personal Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="license-status">Driver's License</Label>
                  <Select value={individual.license_status} onValueChange={(value) => handleIndividualChange('license_status', value)}>
                    <SelectTrigger id="license-status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Valid">Valid</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gun-license-status">Gun License</Label>
                   <Select value={individual.gunLicenseStatus} onValueChange={(value) => handleIndividualChange('gunLicenseStatus', value)}>
                    <SelectTrigger id="gun-license-status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Valid">Valid</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                      <SelectItem value="None">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insurance-status">Insurance</Label>
                   <Select value={individual.insuranceStatus} onValueChange={(value) => handleIndividualChange('insuranceStatus', value)}>
                    <SelectTrigger id="insurance-status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Valid">Valid</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                       <SelectItem value="None">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Registered Firearms</Label>
                  <Button variant="ghost" size="sm" onClick={addGun}><PlusCircle className="mr-2 h-4 w-4" />Add</Button>
                </div>
                <div className="space-y-2">
                  {individual.guns.map((gun, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={gun} onChange={(e) => handleGunChange(index, e.target.value)} />
                      <Button variant="destructive" size="icon" onClick={() => removeGun(index)}><Trash2 className="h-4 w-4"/></Button>
                    </div>
                  ))}
                  {individual.guns.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">No firearms registered.</p>}
                </div>
              </div>

              <Separator className="my-4" />

              <h4 className="font-semibold text-lg">Owned Vehicles</h4>
              <div className="space-y-4">
                {vehicles.map((vehicle, index) => (
                  <div key={vehicle.id} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor={`plate-${index}`}>Plate</Label>
                      <Input id={`plate-${index}`} value={vehicle.plate} onChange={(e) => handleVehicleChange(index, 'plate', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor={`model-${index}`}>Model</Label>
                      <Input id={`model-${index}`} value={vehicle.model} onChange={(e) => handleVehicleChange(index, 'model', e.target.value)} />
                    </div>
                     <div className="space-y-2 col-span-2">
                      <Label htmlFor={`reg-status-${index}`}>Registration</Label>
                      <Select value={vehicle.registration_status} onValueChange={(value) => handleVehicleChange(index, 'registration_status', value)}>
                        <SelectTrigger id={`reg-status-${index}`}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Valid">Valid</SelectItem>
                          <SelectItem value="Expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
                 {vehicles.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">No vehicles registered.</p>}
              </div>

            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No individual record found for this user.</div>
          )}
        </div>
      )}
      <DialogFooter>
        <Button onClick={handleSaveChanges} disabled={loading}>Save changes</Button>
      </DialogFooter>
    </DialogContent>
  );
}


export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'commissioner') {
        router.push('/');
      } else {
        fetchUsers();
      }
    }
  }, [user, authLoading, router]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        title: "Error",
        description: "Could not load user data.",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRoleChange = async (uid: string, newRole: UserProfile['role']) => {
    try {
      await updateUserRole(uid, newRole);
      setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
      toast({
        title: "Success",
        description: "User role has been updated.",
      });
    } catch (error) {
      console.error("Failed to update user role:", error);
      toast({
        title: "Error",
        description: "Could not update user role.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || !user || user.role !== 'commissioner') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5"/>Admin Panel</CardTitle>
          <CardDescription>Manage user roles and records.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.uid}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Select
                        value={u.role}
                        onValueChange={(newRole: UserProfile['role']) => handleRoleChange(u.uid, newRole)}
                        disabled={u.uid === user.uid}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="commissioner">Commissioner</SelectItem>
                          <SelectItem value="civilian">Civilian</SelectItem>
                          <SelectItem value="dispatch">Dispatch</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                       {u.role === 'civilian' && (
                         <Dialog>
                           <DialogTrigger asChild>
                            <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4"/>Edit Records</Button>
                           </DialogTrigger>
                           <EditCivilianDialog user={u} />
                         </Dialog>
                       )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    