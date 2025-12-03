import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
            <h1 className="text-6xl font-bold font-orbitron mb-8 text-transparent bg-clip-text bg-gradient-to-r from-neonBlue via-neonGold to-neonRed">
                SPACE NEWS
            </h1>
            <p className="text-xl text-gray-400 mb-12">
                The future of news is here.
            </p>
            <Link href="/feed" className="px-8 py-4 bg-neonBlue rounded-full text-white font-bold text-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300 transform hover:scale-105">
                Enter the Future
            </Link>
        </div>
    );
}
