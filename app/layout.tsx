import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Heistand Family Foundation - Grant Portal",
  description: "Apply for grants from the Heistand Family Foundation. Supporting children in poverty in the Omaha/Council Bluffs metro area and Western Iowa.",
  icons: {
    icon: '/logos/hff-icon.png',
    apple: '/logos/hff-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: { colorPrimary: '#204652' }
      }}
    >
      <html lang="en">
        <body
          className={`${inter.variable} font-sans antialiased`}
        >
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
