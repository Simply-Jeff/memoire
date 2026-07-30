"use client";

import { BookmarkCard, type Bookmark } from "./BookmarkCard"
import { motion, AnimatePresence } from "framer-motion"

export function BookmarkGrid({ bookmarks }: { bookmarks: Bookmark[] }) {
  if (!bookmarks?.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-64 text-center"
      >
        <h3 className="text-lg font-medium">No bookmarks found</h3>
        <p className="text-muted-foreground mt-1">Start saving some links to see them here.</p>
      </motion.div>
    )
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
      <AnimatePresence>
        {bookmarks.map((bookmark, index) => (
          <motion.div
            key={bookmark.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5), ease: "easeOut" }}
            className="break-inside-avoid"
          >
            <BookmarkCard bookmark={bookmark} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
