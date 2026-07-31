import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/Sidebar"
import { AppHeader } from "@/components/layout/Header"
import { auth } from "@/auth"

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth()

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col w-full h-full min-h-screen">
        <AppHeader user={session?.user} />
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
