export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { stackServerApp } from '@/lib/stack';

export default async function Home() {
  const user = await stackServerApp.getUser();
  if (user) {
    redirect('/dashboard');
  }
  redirect('/onboarding');
}
