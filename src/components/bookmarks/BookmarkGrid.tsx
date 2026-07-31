"use client";

import { useState, useEffect } from "react";
import { BookmarkCard, type Bookmark } from "./BookmarkCard"
import { motion, AnimatePresence } from "framer-motion"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem({ bookmark, index }: { bookmark: Bookmark, index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: bookmark.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5), ease: "easeOut" }}
      className="break-inside-avoid cursor-grab active:cursor-grabbing"
    >
      <BookmarkCard bookmark={bookmark} />
    </motion.div>
  );
}

export function BookmarkGrid({ bookmarks }: { bookmarks: Bookmark[] }) {
  const [items, setItems] = useState<Bookmark[]>(bookmarks);

  useEffect(() => {
    setItems(bookmarks);
  }, [bookmarks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id.toString() === active.id);
      const newIndex = items.findIndex((i) => i.id.toString() === over.id);

      const newOrder = arrayMove(items, oldIndex, newIndex);
      setItems(newOrder);

      // Persist the new order
      try {
        await fetch('/api/bookmarks/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderedIds: newOrder.map(i => i.id) }),
        });
      } catch (err) {
        console.error("Failed to persist order", err);
        // Optionally revert if failure
      }
    }
  }

  if (!bookmarks?.length) {
    // We delegate empty state rendering to the parent to show the Onboarding Wizard
    return null;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        <SortableContext
          items={items.map(i => i.id.toString())}
          strategy={rectSortingStrategy}
        >
          <AnimatePresence>
            {items.map((bookmark, index) => (
              <SortableItem key={bookmark.id} bookmark={bookmark} index={index} />
            ))}
          </AnimatePresence>
        </SortableContext>
      </div>
    </DndContext>
  )
}
