import { db } from "@/db"
import { bookmarks, bookmarkArchives } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import fs from "fs"
import path from "path"

export default async function ReaderMode({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const { id } = await params;
  const bookmarkId = parseInt(id, 10);

  if (isNaN(bookmarkId)) {
    notFound();
  }

  // Ensure user owns bookmark
  const bookmark = await db.select().from(bookmarks).where(
    and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, session.user.id))
  ).get()

  if (!bookmark) {
    notFound()
  }

  const archive = await db.select().from(bookmarkArchives).where(
    and(eq(bookmarkArchives.bookmarkId, bookmarkId), eq(bookmarkArchives.format, 'readable'))
  ).get()

  if (!archive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold">Reader mode unavailable</h1>
        <p className="text-muted-foreground">This bookmark has not been archived for reading, or it could not be parsed into an article format.</p>
        <a href="/" className="text-primary hover:underline">Return Home</a>
      </div>
    )
  }

  const filePath = path.join(process.cwd(), "public", archive.filePath);
  let content = "";
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch (e) {
    console.error("Failed to read archive file:", e);
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold">Failed to load content</h1>
        <a href="/" className="text-primary hover:underline">Return Home</a>
      </div>
    )
  }

  return (
    <article className="prose prose-lg dark:prose-invert mx-auto py-8">
      <h1>{bookmark.title || "Untitled Article"}</h1>
      {bookmark.url && <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground no-underline hover:underline">Original Source</a>}
      <hr className="my-8" />
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  )
}
