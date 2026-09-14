"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Plus, ShoppingBag, User } from 'lucide-react';

const TABS = [
  { href: '/',            icon: Home,        label: 'Home' },
  { href: '/trips',       icon: Search,      label: 'Find Food' },
  { href: '/trips/create', icon: Plus,       label: 'Going Out' },
  { href: '/my-orders',   icon: ShoppingBag, label: 'Orders' },
  { href: '/profile',     icon: User,        label: 'Profile' },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border safe-bottom">
      <div className="flex items-center justify-around px-2 py-1.5">
        {TABS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          const isGoingOut = href === '/trips/create';

          if (isGoingOut) {
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-0.5 px-3"
              >
                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center shadow-indigo -mt-4">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-semibold text-primary-600 mt-0.5">{label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl"
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  active ? 'text-primary-600' : 'text-ink-faint'
                }`}
                strokeWidth={active ? 2.5 : 1.75}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  active ? 'text-primary-600 font-semibold' : 'text-ink-muted'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
