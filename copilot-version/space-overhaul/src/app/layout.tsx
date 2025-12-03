import '../styles/globals.css';
import type { Metadata } from 'next';
import { Inter, Orbitron } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' });

export const metadata: Metadata = {
    title: 'Space News',
    description: 'Futuristic News Aggregator',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} ${orbitron.variable} dark`}>
            <body className="bg-spaceDark text-white min-h-screen">
                {children}
            </body>
        </html>
    );
}
