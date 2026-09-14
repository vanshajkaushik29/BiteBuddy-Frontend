import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'BiteBuddy — Food Pooling for PG & Hostel Students',
  description: 'Find someone already heading your way and order food. Or carry food for your hostel mates and earn rewards.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="bg-background text-ink min-h-screen flex flex-col antialiased pb-16 md:pb-0">
        <ToastProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
              {children}
            </main>
            <Footer />
            <MobileBottomNav />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
