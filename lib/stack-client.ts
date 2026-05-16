'use client';
import { StackClientApp } from '@stackframe/stack';

export const stackClientApp = new StackClientApp({
  tokenStore: 'cookie',
  urls: {
    signIn: '/onboarding',
    afterSignIn: '/dashboard',
    afterSignUp: '/onboarding',
    afterSignOut: '/onboarding',
  },
});
