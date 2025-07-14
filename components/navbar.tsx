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
        <div className="flex flex-col md:flex-row md:justify-between md:items-center h-auto md:h-16 gap-2 md:gap-0">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4 justify-between md:justify-start">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">Kite Hostel</span>
            </Link>
            <ThemeSwitcher />
          </div>

          {/* Navigation Links - mobile: two rows, desktop: one row split by separator */}
          <div className="flex flex-col md:flex-row items-center w-full md:w-auto">
            <div className="flex flex-row md:flex-row w-full md:w-auto justify-center md:justify-start gap-4 md:gap-8">
              {MAIN_ROUTES.slice(0, SEP).map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  className="text-foreground/70 hover:text-foreground transition-colors"
                >
                  {route.label}
                </Link>
              ))}
            </div>
            <Separator orientation="horizontal" className="my-1 md:hidden w-full" />
            <Separator orientation="vertical" className="h-6 mx-2 hidden md:block" />
            <div className="flex flex-row md:flex-row w-full md:w-auto justify-center md:justify-start gap-4 md:gap-8">
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
          </div>

          {/* Auth Section */}
          <div className="flex items-center justify-end mt-2 md:mt-0">
            {/* <AuthButton /> */}
          </div>
        </div>
      </div>
    </nav>
  );
}
