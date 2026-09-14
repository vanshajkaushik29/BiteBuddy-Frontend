"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  UtensilsCrossed,
  Plus,
  Award,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  MapPin,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

// Logo is decorative — Home link is the first nav item
const NAV_LINKS = [
  { href: '/',          label: 'Home' },
  { href: '/trips',     label: 'Find Food' },
  { href: '/my-trips',  label: 'My Trips' },
  { href: '/my-orders', label: 'My Orders' },
  { href: '/rewards',   label: 'Rewards' },
  { href: '/messages',  label: 'Messages' },
];

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    router.push('/login');
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const pgName = user?.pg
    ? (typeof user.pg === 'object' ? user.pg.name : null)
    : null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* 1. LEFT — BITEBUDDY BRAND */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-xs transition-colors group-hover:bg-primary-700">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-ink text-base tracking-tight select-none">
              Bite<span className="text-primary-600">Buddy</span>
            </span>
          </Link>

          {/* 2. CENTER — NAVIGATION */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                      active
                        ? 'bg-primary-50 text-primary-600 font-semibold'
                        : 'text-ink-muted hover:text-ink hover:bg-slate-100/70'
                    } ${label === 'Messages' ? 'flex items-center gap-1.5' : ''}`}
                  >
                    {label === 'Messages' && <MessageSquare className="w-3.5 h-3.5" />}
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* 3. RIGHT — ACTION + PROFILE */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {loading ? null : !user ? (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-ghost text-sm">Log in</Link>
                <Link href="/register" className="btn-primary text-sm px-4 py-2">Sign up</Link>
              </div>
            ) : (
              <>
                {/* Primary CTA */}
                <Link href="/trips/create" className="btn-primary text-sm px-3.5 py-2 font-medium">
                  <Plus className="w-4 h-4" />
                  Going Out
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2.5 pl-2 pr-2.5 py-1.5 rounded-xl hover:bg-slate-100/80 transition-colors border border-transparent hover:border-border"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ring-2 ring-primary-100">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-ink leading-tight">{user.name.split(' ')[0]}</div>
                      {pgName && (
                        <div className="text-[10px] text-ink-muted leading-tight mt-0.5 flex items-center gap-0.5 max-w-[90px] truncate">
                          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />{pgName}
                        </div>
                      )}
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-ink-muted transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-border shadow-card-lg z-20 py-1.5 animate-fade-in">
                        <div className="px-4 py-2.5 border-b border-border">
                          <div className="text-sm font-semibold text-ink">{user.name}</div>
                          <div className="text-xs text-ink-muted truncate">{user.email}</div>
                          <div className="mt-1.5 flex items-center gap-1 text-xs text-primary-600 font-semibold">
                            <Award className="w-3.5 h-3.5" />
                            {user.rewardPoints} reward points
                          </div>
                        </div>
                        <div className="py-1">
                          {user.role === 'admin' && (
                            <Link
                              href="/admin"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-primary-700 bg-primary-50/50 hover:bg-primary-50 font-bold transition-colors"
                            >
                              <ShieldCheck className="w-4 h-4 text-primary-600" />
                              Admin Portal
                            </Link>
                          )}
                          <Link
                            href="/profile"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-ink hover:bg-slate-50 transition-colors"
                          >
                            <User className="w-4 h-4 text-ink-muted" />
                            Profile
                          </Link>
                          <Link
                            href="/rewards"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-ink hover:bg-slate-50 transition-colors"
                          >
                            <Award className="w-4 h-4 text-ink-muted" />
                            Rewards
                          </Link>
                          <Link
                            href="/messages"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-ink hover:bg-slate-50 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4 text-ink-muted" />
                            Messages
                          </Link>
                        </div>
                        <div className="border-t border-border py-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger-500 hover:bg-danger-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Log out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5 text-ink" /> : <Menu className="w-5 h-5 text-ink" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-3 pb-4 space-y-1 animate-slide-up">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2.5 mb-2 bg-slate-50 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-primary-100">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-ink">{user.name}</div>
                    <div className="text-xs text-primary-600 font-medium flex items-center gap-1">
                      <Award className="w-3 h-3" /> {user.rewardPoints} pts
                    </div>
                  </div>
                </div>
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      isActive(href)
                        ? 'bg-primary-50 text-primary-600 font-semibold'
                        : 'text-ink hover:bg-slate-100'
                    }`}
                  >
                    {label === 'Messages' && <MessageSquare className="w-4 h-4" />}
                    {label}
                  </Link>
                ))}
                <Link
                  href="/trips/create"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white mt-2 shadow-indigo"
                >
                  <Plus className="w-4 h-4" /> Going Out
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-ink hover:bg-slate-100"
                >
                  <User className="w-4 h-4 text-ink-muted" /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-danger-500 hover:bg-danger-50"
                >
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-ink hover:bg-slate-100 rounded-xl">Log in</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-xl text-center">Sign up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
