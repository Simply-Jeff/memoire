import { BookmarkCard, type Bookmark } from "./BookmarkCard"

export function BookmarkGrid({ bookmarks }: { bookmarks: Bookmark[] }) {
  if (!bookmarks?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h3 className="text-lg font-medium">No bookmarks found</h3>
        <p className="text-muted-foreground mt-1">Start saving some links to see them here.</p>
      </div>
    )
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
      {bookmarks.map((bookmark) => (
        <div key={bookmark.id} className="break-inside-avoid">
          <BookmarkCard bookmark={bookmark} />
        </div>
      ))}
    </div>
  )
}
