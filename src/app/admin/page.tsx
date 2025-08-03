
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getAllUsers, updateUserRole, updateUserCallSign } from '@/lib/firestore';
import type { UserProfile } from '@/types';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, RadioTower, Save } from 'lucide-react';


export default function UnitManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !['commissioner', 'dispatch'].includes(user.role)) {
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
    // Role changing is a commissioner-only action
    if (user?.role !== 'commissioner') {
        toast({
            title: "Permission Denied",
            description: "Only commissioners can change user roles.",
            variant: "destructive",
        });
        return;
    }

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
  
  const handleCallSignChange = (uid: string, callSign: string) => {
    setUsers(users.map(u => u.uid === uid ? { ...u, callSign: callSign } : u));
  };

  const handleSaveCallSign = async (uid: string, callSign: string | undefined) => {
    // Dispatchers and commissioners can manage call signs
    if (!user || !['commissioner', 'dispatch'].includes(user.role)) {
        toast({
            title: "Permission Denied",
            description: "You do not have permission to change call signs.",
            variant: "destructive",
        });
        return;
    }
    try {
      await updateUserCallSign(uid, callSign || '');
       toast({
        title: "Success",
        description: "Call sign has been updated.",
      });
    } catch (error) {
       console.error("Failed to update call sign:", error);
       toast({
        title: "Error",
        description: "Could not update call sign.",
        variant: "destructive",
      });
    }
  };


  if (authLoading || !user || !['commissioner', 'dispatch'].includes(user.role)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }
  
  const isCommissioner = user.role === 'commissioner';

  return (
    <div className="p-4 lg:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isCommissioner ? <Shield className="h-5 w-5"/> : <RadioTower className="h-5 w-5" />}
            {isCommissioner ? 'Admin Panel' : 'Unit Management'}
          </CardTitle>
          <CardDescription>
            {isCommissioner ? 'Manage user roles and unit call signs.' : 'Manage unit call signs.'}
          </CardDescription>
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
                  <TableHead>Call Sign</TableHead>
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
                        disabled={!isCommissioner || u.uid === user.uid}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="police">Police</SelectItem>
                          <SelectItem value="fd">FD</SelectItem>
                          <SelectItem value="commissioner">Commissioner</SelectItem>
                          <SelectItem value="dispatch">Dispatch</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {['police', 'fd'].includes(u.role) ? (
                        <div className="flex items-center gap-2">
                          <Input 
                            value={u.callSign || ''}
                            onChange={(e) => handleCallSignChange(u.uid, e.target.value)}
                            placeholder="e.g., 2B41"
                          />
                           <Button size="icon" variant="ghost" onClick={() => handleSaveCallSign(u.uid, u.callSign)}>
                             <Save className="h-4 w-4"/>
                           </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
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
