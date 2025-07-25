import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { Toaster } from "@/components/ui/sonner";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Scrape Flow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      elements : {
        formButtonPrimary : "bg-primary hover:bg-primary/90 text-sm !shadow-none"
      }
    }} afterSignOutUrl={"/sign-in"}>

    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AppProviders>
        {children}
        </AppProviders>
        </body>
        <Toaster richColors/>
    </html>
    </ClerkProvider>
  );
}
