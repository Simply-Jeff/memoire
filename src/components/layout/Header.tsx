"use client";

import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Search, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"

export function AppHeader({ user }: { user?: { name?: string | null, email?: string | null, image?: string | null } }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    if (term) {
      router.push(`/?q=${encodeURIComponent(term)}`)
    } else {
      router.push("/")
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 w-full shrink-0 items-center gap-2 border-b bg-background px-4 justify-between">
      <div className="flex items-center gap-2 flex-1">
        <SidebarTrigger className="-ml-2" />
      </div>

      <div className="w-full max-w-sm relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          defaultValue={searchParams.get("q") ?? ""}
          onChange={handleSearch}
          className="w-full rounded-lg bg-background pl-8"
        />
      </div>

      <div className="flex items-center gap-4 flex-1 justify-end">
        {user ? (
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            <a href="/login">Login</a>
          </Button>
        )}
      </div>
    </header>
  )
}
