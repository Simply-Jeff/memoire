import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/Sidebar"
import { AppHeader } from "@/components/layout/Header"
import { TooltipProvider } from "@/components/ui/tooltip"
import { auth } from "@/auth"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "memoire",
  description: "A full-scale bookmark manager app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth()

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar />
            <main className="flex flex-1 flex-col w-full h-full min-h-screen">
              <AppHeader user={session?.user} />
              <div className="flex-1 p-4 md:p-6 lg:p-8">
                {children}
              </div>
            </main>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
