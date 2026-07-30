import { Library } from "lucide-react"

export type Collection = {
  id: number
  userId: string
  name: string
  createdAt: string
}

export function CollectionList({ collections }: { collections: Collection[] }) {
  if (!collections?.length) {
    return (
      <div className="text-sm text-muted-foreground p-4">
        No collections yet.
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {collections.map((collection) => (
        <a
          key={collection.id}
          href={`/collections/${collection.id}`}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Library className="h-4 w-4" />
          {collection.name}
        </a>
      ))}
    </div>
  )
}
