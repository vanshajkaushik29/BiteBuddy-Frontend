import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, Heart, ShieldCheck, Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-border mt-16 text-ink-muted text-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-xs">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-ink tracking-tight">
                Bite<span className="text-primary-600">Buddy</span>
              </span>
            </div>
            <p className="text-ink-muted text-xs sm:text-sm max-w-sm leading-relaxed">
              The hyper-local food-pooling platform for hostel and PG students. Order meals from friends already heading out or earn cash fees & reward points by carrying food for others.
            </p>
            <div className="flex items-center gap-4 text-xs text-ink-muted font-semibold pt-1">
              <span className="flex items-center gap-1 text-teal-600">
                <ShieldCheck className="w-4 h-4 text-teal-500" /> PG Verified Peers
              </span>
              <span className="flex items-center gap-1 text-primary-600">
                <Zap className="w-4 h-4 text-primary-500" /> Near ₹0 Fee
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-ink font-bold mb-3 text-xs uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-primary-600 transition-colors">Home Dashboard</Link></li>
              <li><Link href="/trips" className="hover:text-primary-600 transition-colors">Find Food (Active Trips)</Link></li>
              <li><Link href="/trips/create" className="hover:text-primary-600 transition-colors">Going Out? Announce Trip</Link></li>
              <li><Link href="/my-trips" className="hover:text-primary-600 transition-colors">My Created Trips</Link></li>
              <li><Link href="/my-orders" className="hover:text-primary-600 transition-colors">My Food Orders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-ink font-bold mb-3 text-xs uppercase tracking-wider">Community & Rewards</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/rewards" className="hover:text-teal-600 transition-colors">Rewards Center (+10 Pts)</Link></li>
              <li><Link href="/messages" className="hover:text-primary-600 transition-colors">Direct Messages</Link></li>
              <li><Link href="/profile" className="hover:text-primary-600 transition-colors">Profile & Ratings</Link></li>
              <li><span className="text-ink-faint">Hostel Community Network</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-ink-muted gap-4">
          <p>© {new Date().getFullYear()} BiteBuddy. Crafted for PG and Hostel Students.</p>
          <div className="flex items-center gap-1 text-ink-muted">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for hostel life</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
