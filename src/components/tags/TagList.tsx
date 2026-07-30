import { Hash } from "lucide-react"

export type Tag = {
  id: number
  userId: string
  name: string
}

export function TagList({ tags }: { tags: Tag[] }) {
  if (!tags?.length) {
    return (
      <div className="text-sm text-muted-foreground p-4">
        No tags yet.
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <a
          key={tag.id}
          href={`/tags/${tag.id}`}
          className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Hash className="h-3 w-3" />
          {tag.name}
        </a>
      ))}
    </div>
  )
}
