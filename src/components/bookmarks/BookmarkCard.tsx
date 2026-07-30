

import { Video, FileText, ShoppingBag, MessageCircle, Image as ImageIcon, Link as LinkIcon, BookOpen } from "lucide-react"

export type Bookmark = {
  id: number
  url: string
  title: string | null
  description: string | null
  imageUrl: string | null
  contentType: string | null
  metadata: string | null
  createdAt: string
}

function getContentTypeIcon(type: string | null) {
  switch (type) {
    case 'video': return <Video className="h-4 w-4" />;
    case 'article': return <FileText className="h-4 w-4" />;
    case 'product': return <ShoppingBag className="h-4 w-4" />;
    case 'twitter': return <MessageCircle className="h-4 w-4" />;
    case 'image': return <ImageIcon className="h-4 w-4" />;
    default: return <LinkIcon className="h-4 w-4" />;
  }
}

export function BookmarkCard({ bookmark }: { bookmark: Bookmark }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md h-full flex flex-col">
      <div className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur shadow-sm">
        {getContentTypeIcon(bookmark.contentType)}
      </div>
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
          <div className="mt-auto pt-4 flex flex-col gap-2">
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {new URL(bookmark.url).hostname}
            </span>
            {bookmark.metadata && (() => {
              try {
                const meta = JSON.parse(bookmark.metadata);
                return (
                  <div className="flex flex-wrap gap-1">
                    {meta.collection && (
                      <span className="inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        {meta.collection}
                      </span>
                    )}
                    {meta.tags?.map((tag: string) => (
                      <span key={tag} className="inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )
              } catch (e) {
                return null;
              }
            })()}
          </div>
        </div>
      </a>

      {bookmark.contentType === 'article' && (
        <div className="px-4 pb-4">
          <a href={`/bookmarks/${bookmark.id}`} className="text-sm text-primary flex items-center gap-1 hover:underline">
            <BookOpen className="h-4 w-4" /> Read Article
          </a>
        </div>
      )}
    </div>
  )
}
