import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import Image from 'next/image';
import { APP_NAME } from '@/constants/app';
import UserAuthForm from './user-auth-form';
import AuthRedirect from '@/components/auth/auth-redirect';

export default function SignInViewPage() {
  return (
    <>
      <AuthRedirect redirectTo='/dashboard' requireAuth={false} />
      <div className='background-diagonal relative flex min-h-screen w-full items-center justify-center overflow-hidden font-sans'>
        <Card className='w-[350px] gap-4'>
          <CardHeader>
            <div className='m-auto'>
              <Image
                src='/assets/images/VaultWrx_CMYK.png'
                alt='logo'
                width={200}
                height={60}
                className='rounded-lg'
              />
            </div>
            <CardTitle className='text-center text-lg tracking-tight'>
              Please Sign In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserAuthForm />
          </CardContent>
          <CardFooter>
            <p className='text-muted-foreground mt-2 w-full px-8 text-center text-sm'>
              © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
