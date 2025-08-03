
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset
} from '@/components/ui/sidebar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LayoutDashboard, 
  Siren, 
  Database, 
  MessageSquare, 
  Shield, 
  LogOut,
  ChevronDown,
  Settings,
  BrainCircuit,
  User as UserIcon,
  Home
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { IncidentList } from '@/components/dashboard/IncidentList';
import { RecordsSearch } from '@/components/dashboard/RecordsSearch';
import { SecureComms } from '@/components/dashboard/SecureComms';
import { IntelFeed } from '@/components/dashboard/IntelFeed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activePage, setActivePage] = React.useState('dashboard');

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  const handleMenuClick = (page: string) => {
    setActivePage(page);
    if(page !== 'dashboard') {
      router.push(`/${page}`);
    } else {
      router.push('/');
    }
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'commissioner':
      case 'user':
        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-1 lg:col-span-3">
                <IncidentList />
            </div>
            <div className="col-span-1 lg:col-span-2 row-start-2">
                <RecordsSearch />
            </div>
            <div className="col-span-1 lg:col-span-1 row-start-3 lg:row-start-2">
                <SecureComms />
            </div>
            <div className="col-span-1 lg:col-span-3 row-start-4 lg:row-start-3">
                <IntelFeed />
            </div>
          </div>
        );
      case 'dispatch':
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-1 lg:col-span-3">
                    <IncidentList />
                </div>
                <div className="col-span-1 lg:col-span-2 row-start-2">
                    <RecordsSearch />
                </div>
                <div className="col-span-1 lg:col-span-1 row-start-3 lg:row-start-2">
                    <SecureComms />
                </div>
            </div>
        );
        case 'civilian':
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome, {user.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>This is your civilian dashboard. There are no active items for you at this time.</p>
                    </CardContent>
                </Card>
            );
      default:
        return <div>Invalid user role.</div>;
    }
  };

  const renderSidebarMenu = () => {
    switch(user.role) {
      case 'commissioner':
      case 'user':
        return (
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={() => handleMenuClick('dashboard')} isActive={activePage === 'dashboard'} tooltip="Dashboard">
                    <LayoutDashboard />
                    Dashboard
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Active Incidents">
                <Siren />
                Active Incidents
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Records">
                <Database />
                Records
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Comms">
                <MessageSquare />
                Comms
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton tooltip="Intel Feed">
                <BrainCircuit />
                Intel Feed
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        );
      case 'dispatch':
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => handleMenuClick('dashboard')} isActive={activePage === 'dashboard'} tooltip="Dashboard">
                        <LayoutDashboard />
                        Dashboard
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <SidebarMenuButton tooltip="Active Incidents">
                    <Siren />
                    Active Incidents
                </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <SidebarMenuButton tooltip="Records">
                    <Database />
                    Records
                </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <SidebarMenuButton tooltip="Comms">
                    <MessageSquare />
                    Comms
                </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        );
        case 'civilian':
            return (
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => handleMenuClick('dashboard')} isActive={activePage === 'dashboard'} tooltip="Dashboard">
                            <Home />
                            Home
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            );
        default:
            return null;
    }
  }


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg text-primary-foreground">
              <Siren className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold font-headline">ResponseReady</h2>
              <p className="text-xs text-muted-foreground">MDT</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
         {renderSidebarMenu()}
        </SidebarContent>
        <SidebarFooter>
          {/* Footer content if any */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
          <SidebarTrigger className="md:hidden" />
          <div className="w-full flex-1">
            {/* Can add breadcrumbs or page title here */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-auto px-2 flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://placehold.co/100x100.png`} alt={user.name} data-ai-hint="profile avatar" />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                    <span className="hidden md:inline">{user.name}</span>
                    <span className="hidden md:inline text-xs text-muted-foreground capitalize">{user.role}</span>
                </div>
                <ChevronDown className="h-4 w-4 hidden md:inline"/>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user.role === 'commissioner' && (
                <DropdownMenuItem asChild>
                  <Link href="/admin">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          {renderDashboard()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
