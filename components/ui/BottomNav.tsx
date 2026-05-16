'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { href: '/dashboard', icon: '⬡', label: 'Base' },
  { href: '/seance', icon: '⚔', label: 'Quête' },
  { href: '/nutrition', icon: '🍱', label: 'Nutrition' },
  { href: '/progression', icon: '📈', label: 'Stats' },
  { href: '/profil', icon: '👤', label: 'Profil' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-violet-900 bg-black bg-opacity-95 backdrop-blur-md">
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {NAV_ITEMS.map(item => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 relative">
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-cyan-400"
                  style={{ boxShadow: '0 0 8px #06b6d4' }} />
              )}
              <span className={`text-xl ${active ? 'filter drop-shadow-[0_0_6px_#06b6d4]' : 'opacity-40'}`}>
                {item.icon}
              </span>
              <span className={`text-xs font-orbitron uppercase tracking-wider ${active ? 'text-cyan-400' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
