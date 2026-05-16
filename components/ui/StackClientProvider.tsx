'use client';
import { StackProvider, StackTheme } from '@stackframe/stack';
import PWAInit from './PWAInit';

function createStackApp() {
  try {
    const { StackClientApp } = require('@stackframe/stack');
    return new StackClientApp({
      tokenStore: 'cookie',
      urls: {
        signIn: '/onboarding',
        afterSignIn: '/dashboard',
        afterSignUp: '/onboarding',
        afterSignOut: '/onboarding',
      },
    });
  } catch {
    return null;
  }
}

const stackClientApp = createStackApp();

export default function StackClientProvider({ children }: { children: React.ReactNode }) {
  if (!stackClientApp) {
    return (
      <>
        <PWAInit />
        {children}
      </>
    );
  }

  return (
    <StackProvider app={stackClientApp}>
      <StackTheme>
        <PWAInit />
        {children}
      </StackTheme>
    </StackProvider>
  );
}
