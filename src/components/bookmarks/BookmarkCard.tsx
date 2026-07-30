

export type Bookmark = {
  id: number
  url: string
  title: string | null
  description: string | null
  imageUrl: string | null
  createdAt: string
}

export function BookmarkCard({ bookmark }: { bookmark: Bookmark }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md h-full flex flex-col">
      <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="flex-1 flex flex-col">
        {bookmark.imageUrl ? (
          <div className="relative w-full aspect-video overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bookmark.imageUrl}
              alt={bookmark.title || 'Bookmark image'}
              className="object-cover w-full h-full transition-transform group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="relative w-full aspect-video bg-muted flex items-center justify-center border-b">
            <span className="text-muted-foreground">No preview</span>
          </div>
        )}
        <div className="p-4 flex flex-col gap-1.5 flex-1">
          <h3 className="font-semibold leading-tight line-clamp-2">
            {bookmark.title || bookmark.url}
          </h3>
          {bookmark.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {bookmark.description}
            </p>
          )}
          <div className="mt-auto pt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {new URL(bookmark.url).hostname}
            </span>
          </div>
        </div>
      </a>
    </div>
  )
}
