import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link"; // Next.js optimized routing

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Artistic Showcase",
  description: "A creative portfolio platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        
        {/* --- NAVIGATION BAR --- */}
        <nav className="w-full bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
          <div className="text-xl font-bold text-gray-800 tracking-tight">
            Artistic Showcase
          </div>
          <div className="flex gap-6">
            <Link 
              href="/gallery" 
              className="text-gray-600 hover:text-blue-600 font-semibold transition-colors"
            >
              Gallery
            </Link>
            <Link 
              href="/" 
              className="text-gray-600 hover:text-blue-600 font-semibold transition-colors"
            >
              Admin
            </Link>
          </div>
        </nav>

        {/* The current page loads inside this main tag */}
        <main>
          {children}
        </main>

      </body>
    </html>
  );
}