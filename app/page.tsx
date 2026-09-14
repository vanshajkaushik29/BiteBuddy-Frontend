"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { api, Trip } from '@/lib/api';
import { TripCard } from '@/components/TripCard';
import { TripCardSkeleton } from '@/components/Skeleton';
import {
  UtensilsCrossed,
  Plus,
  Search,
  ArrowRight,
  Award,
  Users,
  Zap,
  ShieldCheck,
  Coins,
  HeartHandshake,
  MapPin,
  Clock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setTripsLoading(true);
      api.trips.getAll()
        .then(data => setTrips(data.slice(0, 4)))
        .catch(() => setTrips([]))
        .finally(() => setTripsLoading(false));
    }
  }, [user]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name ? user.name.split(' ')[0] : '';
  const pgName = user?.pg ? (typeof user.pg === 'object' ? user.pg.name : null) : null;

  return (
    <div className="space-y-12 animate-fade-in pb-8">
      
      {/* ── 1. HERO SECTION ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-primary-700 to-indigo-800 text-white shadow-card-lg">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12">
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-5">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-indigo-100 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/20">
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Peer-to-Peer Food Pooling for Hostels & PGs</span>
            </div>

            {/* Main Catchy Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]">
              {user ? (
                <>
                  {greeting}, <span className="text-amber-300">{firstName}</span>! 👋<br />
                  <span className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold opacity-95">
                    Never order food alone again.
                  </span>
                </>
              ) : (
                <>
                  Craving food? <br />
                  <span className="text-amber-300">Your PG buddies</span> are already heading out!
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-indigo-100/90 text-sm sm:text-base leading-relaxed max-w-xl">
              Connect with hostel mates already visiting nearby cafes and restaurants. Get your favorite meals delivered with <strong className="text-white">near-zero delivery fees</strong>, or carry food on your trip to earn <strong className="text-amber-300">cash fees + reward points</strong>!
            </p>

            {/* Action Buttons in Hero */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/trips"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-primary-700 hover:bg-indigo-50 font-bold text-sm transition-all shadow-md active:scale-95"
              >
                <Search className="w-4 h-4" />
                Find Food Trips
              </Link>
              <Link
                href="/trips/create"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-ink font-bold text-sm transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Announce a Trip (Going Out)
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-200/90 pt-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-300" /> 100% PG-Verified Peers
              </span>
              <span className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-300" /> ₹0 App Commission
              </span>
              {pgName && (
                <span className="flex items-center gap-1.5 text-amber-200 font-semibold">
                  <MapPin className="w-3.5 h-3.5" /> {pgName}
                </span>
              )}
            </div>
          </div>

          {/* Right Hero Image */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 transform hover:scale-[1.02] transition-transform duration-300">
              <img
                src="/images/food_pooling_hero.jpg"
                alt="Two friendly hostel students happily sharing and delivering food in PG corridor"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 right-3 bg-ink/75 backdrop-blur-md rounded-xl p-2.5 text-white flex items-center justify-between border border-white/15">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center text-white">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">Food Pooling Active</div>
                    <div className="text-[10px] text-slate-300">Hostel room delivery</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-success-500 text-white px-2 py-0.5 rounded-full">
                  Save ₹60+
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. PRIMARY ACTION CARDS ────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-ink tracking-tight">Quick Actions</h2>
            <p className="text-xs text-ink-muted mt-0.5">Choose how you want to use BiteBuddy right now</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Find Food Card */}
          <Link
            href="/trips"
            className="group relative bb-card p-6 border border-border hover:border-primary-300 hover:shadow-indigo transition-all duration-200 hover:-translate-y-1 overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-light flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-colors">
              <Search className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors" />
            </div>
            <div className="font-bold text-ink text-lg">Find Food</div>
            <p className="text-xs text-ink-muted mt-1 max-w-xs leading-relaxed">
              Browse friends and PG mates already heading to restaurants. Place your order in seconds.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 group-hover:gap-2.5 transition-all">
              <span>Browse Active Trips</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Going Out Card */}
          <Link
            href="/trips/create"
            className="group relative bb-card p-6 bg-gradient-to-br from-primary-600 to-primary-700 text-white border-primary-600 hover:from-primary-700 hover:to-primary-800 transition-all duration-200 hover:-translate-y-1 shadow-indigo overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div className="font-bold text-white text-lg">Going Out?</div>
            <p className="text-xs text-white/85 mt-1 max-w-xs leading-relaxed">
              Stepping out to eat? Create a trip, carry food for your mates, and earn cash fees + points.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 group-hover:gap-2.5 transition-all">
              <span>Create New Trip</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* User Stats Row (if logged in) */}
        {user && (
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bb-card px-4 py-3 text-center">
              <div className="text-xl font-extrabold text-primary-600">{user.rewardPoints}</div>
              <div className="text-[11px] text-ink-muted font-semibold uppercase tracking-wider mt-0.5">Reward Points</div>
            </div>
            <div className="bb-card px-4 py-3 text-center">
              <div className="text-xl font-extrabold text-teal-600">
                {user.averageRating > 0 ? `${user.averageRating.toFixed(1)} ★` : '5.0 ★'}
              </div>
              <div className="text-[11px] text-ink-muted font-semibold uppercase tracking-wider mt-0.5">Carrier Rating</div>
            </div>
            <Link href="/rewards" className="bb-card px-4 py-3 text-center hover:border-primary-300 transition-colors group">
              <div className="text-xl font-extrabold text-ink flex items-center justify-center gap-1 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 text-warning-500" />
              </div>
              <div className="text-[11px] text-primary-600 font-semibold uppercase tracking-wider mt-0.5">Redeem Rewards</div>
            </Link>
          </div>
        )}
      </section>

      {/* ── 3. ACTIVE TRIPS SECTION (FOR AUTHENTICATED USERS) ────────────────── */}
      {user && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Active Trips in Your PG</h2>
              <p className="text-xs text-ink-muted">Friends currently accepting orders</p>
            </div>
            <Link href="/trips" className="text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1">
              View all trips <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {tripsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map(i => <TripCardSkeleton key={i} />)}
            </div>
          ) : trips.length === 0 ? (
            <div className="bb-card py-8 px-6 text-center border-dashed">
              <UtensilsCrossed className="w-8 h-8 text-ink-faint mx-auto mb-2" />
              <p className="text-sm font-bold text-ink">No active trips from your PG right now</p>
              <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
                Heading out for snacks or dinner? Be the first to create a trip and help your mates!
              </p>
              <Link href="/trips/create" className="btn-primary text-xs mt-4 inline-flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Create a Trip
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trips.map(trip => (
                <TripCard
                  key={trip._id}
                  trip={trip}
                  currentUserId={user._id}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── 4. HOW BITEBUDDY WORKS ─────────────────────────────────────────── */}
      <section className="bb-card p-6 sm:p-10 space-y-8 bg-white border border-border">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" /> Easy 3-Step Process
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            How BiteBuddy Works
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            A seamless, trusted cycle between friends stepping out and friends staying in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="relative bg-slate-50/80 rounded-2xl p-6 border border-slate-100 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-primary-600 text-white font-black text-lg flex items-center justify-center shadow-indigo">
              01
            </div>
            <h3 className="font-bold text-ink text-base">Announce Your Run</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Stepping out to McDonald&apos;s, Burger King, or the local market? Post a quick trip with your destination and cut-off time.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative bg-slate-50/80 rounded-2xl p-6 border border-slate-100 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500 text-white font-black text-lg flex items-center justify-center shadow-teal">
              02
            </div>
            <h3 className="font-bold text-ink text-base">PG Mates Place Orders</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Roommates browse your trip, write their food items, and order together with a tiny nominal carrying fee (e.g. ₹20).
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative bg-slate-50/80 rounded-2xl p-6 border border-slate-100 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white font-black text-lg flex items-center justify-center shadow-md">
              03
            </div>
            <h3 className="font-bold text-ink text-base">Deliver & Earn Rewards</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Bring food back to your PG, collect payment, and earn instant cash fee + <strong className="text-primary-600">+10 reward points</strong> per delivery!
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. WHY BITEBUDDY (VALUE PROPOSITIONS) ────────────────────────────── */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> Why Students Love Us
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Why Choose BiteBuddy?
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Built from the ground up to solve common hostel food problems.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Prop 1 */}
          <div className="bb-card p-5 space-y-3 border border-border hover:shadow-card-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xl">
              ⚡
            </div>
            <h3 className="text-sm font-bold text-ink">Minimum Delivery Cost (Almost ₹0)</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Skip ₹50-₹90 commercial surge charges and high small-cart penalties. Pay just a minimal peer carrying fee of ₹15–₹25.
            </p>
          </div>

          {/* Prop 2 */}
          <div className="bb-card p-5 space-y-3 border border-border hover:shadow-card-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xl">
              🏆
            </div>
            <h3 className="text-sm font-bold text-ink">Rewards & Pocket Money</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Every delivery gets you +10 points. Accumulate points to unlock cash payouts (e.g. ₹50 at 100 pts), free goodies & food vouchers.
            </p>
          </div>

          {/* Prop 3 */}
          <div className="bb-card p-5 space-y-3 border border-border hover:shadow-card-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl">
              🤝
            </div>
            <h3 className="text-sm font-bold text-ink">Build Strong PG Friendships</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Connect with fellow residents, break the ice, build trust, and help each other during late-night study sessions or busy days.
            </p>
          </div>

          {/* Prop 4 */}
          <div className="bb-card p-5 space-y-3 border border-border hover:shadow-card-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-xl">
              🚪
            </div>
            <h3 className="text-sm font-bold text-ink">Direct Hostel Handover</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              No walking out of your hostel gate in the middle of the night. Food is handed directly to your floor, room, or PG common area.
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. CALL TO ACTION BANNER ────────────────────────────────────────── */}
      <section className="rounded-3xl bg-slate-900 text-white p-8 sm:p-10 text-center space-y-4 shadow-card-lg">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Ready to save money or earn on your next food trip?
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto">
          Join thousands of PG & Hostel students food-pooling every day across campus accommodations.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={user ? "/trips" : "/register"}
            className="btn-primary text-sm px-6 py-2.5 shadow-indigo"
          >
            {user ? "Explore Trips" : "Get Started Free"}
          </Link>
          <Link
            href={user ? "/trips/create" : "/login"}
            className="btn-secondary text-sm px-6 py-2.5 bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
          >
            {user ? "Post a Trip" : "Log In"}
          </Link>
        </div>
      </section>

    </div>
  );
}
