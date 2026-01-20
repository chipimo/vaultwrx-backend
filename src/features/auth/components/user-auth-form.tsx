'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import GithubSignInButton from './github-auth-button';
import Link from 'next/link';
import { PasswordInput } from '@/components/password-input';
import GoogleSignInButton from './google-auth-button';
import { login } from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(1, {
    message: 'Please enter your password'
  })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signIn } = useAuth();
  const callbackUrl = searchParams.get('callbackUrl');
  const sessionExpired = searchParams.get('expired') === 'true';
  const [loading, startTransition] = useTransition();
  const [showError, setShowError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showSessionExpired, setShowSessionExpired] = useState<boolean>(sessionExpired);

  const defaultValues = {
    email: '',
    password: ''
  };

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValue) => {
    setShowError(false);
    setErrorMessage('');

    startTransition(async () => {
      try {
        const response = await login(data.email, data.password);

        if (response.success && response.data?.access_token) {
          // Store token, user info, and token expiry using the auth hook
          // Pass user data from login response to avoid extra API call
          await signIn(
            response.data.access_token, 
            response.data.user,
            response.data.expires_in
          );

          toast.success('Signed in successfully!');

          // Redirect to callback URL or dashboard
          const redirectTo = callbackUrl || '/dashboard';
          router.push(redirectTo);
        } else {
          // Handle error response
          const errorMsg =
            response.error?.message ||
            'Login failed. Please check your credentials.';
          setErrorMessage(errorMsg);
          setShowError(true);
          toast.error(errorMsg);
        }
      } catch (error: any) {
        const errorMsg =
          error.message || 'An unexpected error occurred. Please try again.';
        setErrorMessage(errorMsg);
        setShowError(true);
        toast.error(errorMsg);
      }
    });
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-2'
        >
          {showSessionExpired && (
            <div
              className='relative rounded border border-amber-400 bg-amber-50 px-4 py-3 text-amber-800'
              role='alert'
            >
              <strong className='font-bold'>Session Expired </strong>
              <span className='block sm:inline'>Your session has expired. Please sign in again.</span>
              <span className='absolute top-0 right-0 bottom-0 px-4 py-3'>
                <svg
                  onClick={() => setShowSessionExpired(false)}
                  className='h-6 w-6 cursor-pointer fill-current text-amber-600'
                  role='button'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                >
                  <title>Close</title>
                  <path d='M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z' />
                </svg>
              </span>
            </div>
          )}
          {showError && (
            <div
              className='relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700'
              role='alert'
            >
              <strong className='font-bold'>Error! </strong>
              <span className='block sm:inline'>{errorMessage}</span>
              <span className='absolute top-0 right-0 bottom-0 px-4 py-3'>
                <svg
                  onClick={() => setShowError(false)}
                  className='h-6 w-6 cursor-pointer fill-current text-red-500'
                  role='button'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                >
                  <title>Close</title>
                  <path d='M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z' />
                </svg>
              </span>
            </div>
          )}
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem className='gap-0'>
                <FormControl>
                  <Input
                    className='rounded-b-none'
                    type='email'
                    placeholder='Enter your email...'
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem className='relative -mt-2'>
                <FormControl>
                  <PasswordInput
                    className='mt-0'
                    placeholder='Password'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <Link
              href='/auth/forgot-password'
              className='text-muted-foreground text-sm font-medium hover:opacity-75'
            >
              Forgot password?
            </Link>
          </div>
          <Button
            disabled={loading}
            className='mt-2 ml-auto w-full'
            type='submit'
          >
            {loading ? 'Signing in...' : 'Continue With Email'}
          </Button>
        </form>
      </Form>
      <div className='relative mt-3'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background text-muted-foreground px-2'>
            Or continue with
          </span>
        </div>
      </div>
      <div className='mt-3'>
        <GoogleSignInButton />
      </div>
    </>
  );
}
