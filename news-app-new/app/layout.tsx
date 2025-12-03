import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cleary News',
  description: 'Intelligent news. Minimal. Professional.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        {children}
      </body>
    </html>
  );
}
