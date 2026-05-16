'use client';
import { StackProvider, StackTheme } from '@stackframe/stack';
import { stackClientApp } from '@/lib/stack-client';
import PWAInit from './PWAInit';

export default function StackClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <StackProvider app={stackClientApp}>
      <StackTheme>
        <PWAInit />
        {children}
      </StackTheme>
    </StackProvider>
  );
}
