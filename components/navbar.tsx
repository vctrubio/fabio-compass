import Link from "next/link";
import { AuthButton } from "@/components/with-init/auth-button";
import { MAIN_ROUTES } from "@/config/routes";
import { Separator } from "@/components/ui/separator";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Navbar() {
  const SEP = 3;
  return (
    <nav className="w-full py-2 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">Kite Hostel</span>
            </Link>
            <ThemeSwitcher />
          </div>

          {/* Navigation Links */}
          <div className="md:flex items-center space-x-6">
            {MAIN_ROUTES.slice(0, SEP).map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className="text-foreground/70 hover:text-foreground transition-colors"
              >
                {route.label}
              </Link>
            ))}
            <Separator orientation="vertical" className="h-6" />
            {MAIN_ROUTES.slice(SEP).map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className="text-foreground/70 hover:text-foreground transition-colors"
              >
                {route.label}
              </Link>
            ))}
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
