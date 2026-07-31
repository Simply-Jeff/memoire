import { BookmarkGrid } from "@/components/bookmarks/BookmarkGrid"
import { AddBookmarkDialog } from "@/components/bookmarks/AddBookmarkDialog"
import { db } from "@/db"
import { bookmarks } from "@/db/schema"
import { desc, eq, or, like, and } from "drizzle-orm"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

import { ClientSync } from "@/components/bookmarks/ClientSync"
import { OnboardingWizard } from "@/components/bookmarks/OnboardingWizard"

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const { q } = await searchParams;

  let allBookmarks = [];
  if (q) {
    const searchPattern = `%${q}%`;
    allBookmarks = await db.select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, session.user.id),
          or(
            like(bookmarks.title, searchPattern),
            like(bookmarks.description, searchPattern),
            like(bookmarks.url, searchPattern)
          )
        )
      )
      .orderBy(bookmarks.sortOrder, desc(bookmarks.createdAt))
      .execute();
  } else {
    allBookmarks = await db.select().from(bookmarks).where(eq(bookmarks.userId, session.user.id)).orderBy(bookmarks.sortOrder, desc(bookmarks.createdAt)).execute()
  }

  const isSearch = !!q;

  return (
    <div className="flex flex-col gap-6 relative min-h-[calc(100vh-6rem)]">
      <ClientSync userId={session.user.id} />
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Everything</h1>
        <p className="text-muted-foreground">All your saved items in one place.</p>
      </div>

      {allBookmarks.length === 0 && !isSearch ? (
        <OnboardingWizard />
      ) : (
        <BookmarkGrid bookmarks={allBookmarks} />
      )}

      <AddBookmarkDialog />
    </div>
  );
}
