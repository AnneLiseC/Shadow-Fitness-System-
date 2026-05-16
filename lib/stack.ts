import 'server-only';
import { StackServerApp } from '@stackframe/stack';

const CONFIG = {
  tokenStore: 'nextjs-cookie' as const,
  urls: {
    signIn: '/onboarding',
    afterSignIn: '/dashboard',
    afterSignUp: '/onboarding',
    afterSignOut: '/onboarding',
  },
};

// eslint-disable-next-line prefer-const
let _app: StackServerApp | null = null;

export function getStackServerApp(): StackServerApp {
  if (!_app) {
    _app = new StackServerApp(CONFIG);
  }
  return _app;
}

// Proxy pour compatibilité d'import direct
export const stackServerApp = new Proxy({} as StackServerApp, {
  get(_target, prop) {
    const app = getStackServerApp();
    const val = (app as any)[prop];
    return typeof val === 'function' ? val.bind(app) : val;
  },
});
