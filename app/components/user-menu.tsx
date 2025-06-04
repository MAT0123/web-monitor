'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, LucideUser } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';

export function UserMenu() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    if (user !== undefined) {
      setIsLoading(false);
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await user?.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (isLoading || !user) {
    return <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user.displayName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.displayName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.primaryEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push('/handler/account-settings')}
        >
          <LucideUser className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
