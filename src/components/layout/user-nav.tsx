'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export function UserNav() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // Error handling is done in the signOut function
    }
  };

  if (!user) {
    return null;
  }

  const userDisplayName = user.email?.split('@')[0] || 'User';
  const userEmail = user.email || 'user@example.com';

  return (
    <div className='flex items-center gap-2'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className='flex items-center gap-2 rounded-md bg-gray-700 p-1 text-white'>
            <div>
              <UserAvatarProfile
                className='h-8 w-8 rounded-lg'
                showInfo
                user={{
                  fullName: userDisplayName,
                  emailAddresses: [{ emailAddress: userEmail }],
                  imageUrl: ''
                }}
              />
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className='w-56'
          align='end'
          sideOffset={10}
          forceMount
        >
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm leading-none font-medium'>
                {userDisplayName}
              </p>
              {userEmail && (
                <p className='text-muted-foreground text-xs leading-none'>
                  {userEmail}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>New Team</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
