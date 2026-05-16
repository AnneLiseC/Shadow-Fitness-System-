'use client';
import { StackClientApp } from '@stackframe/stack';

export const stackClientApp = new StackClientApp({
  tokenStore: 'cookie',
  urls: {
    handler: '/handler',
    signIn: '/onboarding',
    afterSignIn: '/dashboard',
    afterSignUp: '/onboarding',
    afterSignOut: '/onboarding',
  },
});
