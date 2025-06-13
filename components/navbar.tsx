import Link from "next/link";
import { AuthButton } from "@/components/with-init/auth-button";

export default function Navbar() {
  return (
    <nav className="w-full py-2 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Kite App</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/protected" 
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Protected
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center">
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
