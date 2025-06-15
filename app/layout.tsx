import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import WatchBar from "@/components/userStatus/WatchBar";
import Navbar from "@/components/navbar";
import { Toaster } from "sonner";
import { WalletProvider } from "@/providers/WalletProvider";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Fabio",
  description: "Fabio Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <WalletProvider>
            <Navbar />
            {/* <WatchBar /> */} 
            {children}
            <Toaster richColors position="top-left" />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
