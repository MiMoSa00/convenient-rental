'use client';

import LoginForm from '@/components/LoginForm';
import ThemeWrapper from '@/components/ThemeWrapper';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  return (
    <ThemeWrapper>
      {error && (
        <div className="max-w-md mx-auto mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error === 'CredentialsSignin' ? 'Invalid email or password' : error}
        </div>
      )}
      <LoginForm />
    </ThemeWrapper>
  );
}
