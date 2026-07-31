

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

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Archive, Download } from "lucide-react";

export function BookmarkCard({ bookmark }: { bookmark: Bookmark }) {
  const [isOpen, setIsOpen] = useState(false);
  const hostname = new URL(bookmark.url).hostname;

  // Custom parsing for Price from metadata for products
  let price = null;
  let parsedMeta = null;
  if (bookmark.metadata) {
    try {
      parsedMeta = JSON.parse(bookmark.metadata);
      if (parsedMeta.price) price = parsedMeta.price;
    } catch (e) {}
  }

  // Custom styling blocks depending on type
  const isTwitter = bookmark.contentType === 'twitter';
  const isProduct = bookmark.contentType === 'product';
  const isVideo = bookmark.contentType === 'video';
  const isGithub = hostname.includes('github.com');
  const isReddit = hostname.includes('reddit.com');

  let cardStyle = "bg-card";
  let dynamicInlineStyle = {};

  if (isTwitter) {
    cardStyle = "bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900";
  } else if (isGithub) {
    cardStyle = "bg-neutral-900 text-neutral-50 border-neutral-800";
  } else if (isReddit) {
    cardStyle = "bg-orange-50/50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900";
  } else if (parsedMeta?.themeColor) {
    // Light tint overlay using a CSS variable workaround for inline tailwind-like behavior
    dynamicInlineStyle = {
      borderTop: `4px solid ${parsedMeta.themeColor}`
    };
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        <div className={`group relative overflow-hidden rounded-xl border text-card-foreground shadow-sm transition-all hover:shadow-md h-full flex flex-col cursor-pointer ${cardStyle}`} style={dynamicInlineStyle}>
          <div className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur shadow-sm">
            {getContentTypeIcon(bookmark.contentType)}
          </div>

          <div className="flex-1 flex flex-col">
            {bookmark.imageUrl ? (
              <div className="relative w-full aspect-video overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bookmark.imageUrl}
                  alt={bookmark.title || 'Bookmark image'}
                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                />
                {isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                    <div className="bg-background/90 rounded-full p-3 shadow-lg">
                      <Video className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-full h-32 bg-muted flex items-center justify-center border-b">
                <span className="text-muted-foreground">{isGithub ? "Repository" : "No preview"}</span>
              </div>
            )}

            <div className={`p-4 flex flex-col gap-1.5 flex-1 ${isGithub ? 'text-neutral-200' : ''}`}>
              <h3 className={`font-semibold leading-tight line-clamp-2 ${isGithub ? 'text-white' : ''}`}>
                {bookmark.title || bookmark.url}
              </h3>

              {bookmark.description && (
                <p className={`text-sm line-clamp-3 ${isGithub ? 'text-neutral-400' : 'text-muted-foreground'}`}>
                  {bookmark.description}
                </p>
              )}

              <div className="mt-auto pt-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className={`text-xs truncate max-w-[200px] font-medium ${isGithub ? 'text-neutral-500' : 'text-muted-foreground'}`}>
                    {parsedMeta?.siteName || hostname}
                  </span>
                  {isProduct && price && (
                    <span className="font-bold text-green-600 dark:text-green-400">{price}</span>
                  )}
                </div>

                {parsedMeta && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {parsedMeta.collection && (
                      <span className="inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-semibold bg-secondary text-secondary-foreground">
                        {parsedMeta.collection}
                      </span>
                    )}
                    {parsedMeta.tags?.map((tag: string) => (
                      <span key={tag} className="inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-semibold text-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      }/>

      <DialogContent className="max-w-4xl w-[90vw] h-[85vh] p-0 overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-start bg-muted/30" style={parsedMeta?.themeColor ? { borderTop: `4px solid ${parsedMeta.themeColor}` } : {}}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-background shadow-sm mt-1">
              {getContentTypeIcon(bookmark.contentType)}
            </div>
            <div>
              <h2 className="font-semibold text-lg line-clamp-2">{bookmark.title || parsedMeta?.siteName || hostname}</h2>
              <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 mt-1">
                {parsedMeta?.siteName || hostname} <LinkIcon className="h-3 w-3" />
              </a>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => toast.success("Archival job triggered.")}>
              <Archive className="h-4 w-4 mr-2" /> Archive
            </Button>
          </div>
        </div>

        <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-4 border-b">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="reader">Reader Mode</TabsTrigger>
              <TabsTrigger value="screenshot">Screenshot</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto bg-background p-6">
            <TabsContent value="details" className="mt-0 h-full">
              {isVideo && (
                 <div className="w-full aspect-video bg-black rounded-lg mb-6 overflow-hidden">
                    {bookmark.url.includes('youtube.com') || bookmark.url.includes('youtu.be') ? (
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${bookmark.url.includes('v=') ? new URLSearchParams(new URL(bookmark.url).search).get('v') : bookmark.url.split('/').pop()}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center flex-col gap-4 text-white">
                         <Video className="h-12 w-12 opacity-50" />
                         <p>Cannot embed this video type directly.</p>
                         <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-primary rounded-md text-sm">Watch on {hostname}</a>
                      </div>
                    )}
                 </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    {bookmark.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={bookmark.imageUrl} alt="Preview" className="w-full rounded-lg border shadow-sm" />
                    )}
                 </div>

                 <div className="space-y-6">
                    <div>
                       <h3 className="text-xl font-bold mb-2">{bookmark.title}</h3>
                       <p className="text-muted-foreground">{bookmark.description}</p>
                    </div>

                    {isProduct && price && (
                       <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                         {price}
                       </div>
                    )}

                    {parsedMeta && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Metadata</h4>
                        <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
                          {JSON.stringify(parsedMeta, null, 2)}
                        </pre>
                      </div>
                    )}
                 </div>
              </div>
            </TabsContent>

            <TabsContent value="reader" className="mt-0 h-full">
              {bookmark.contentType === 'article' ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <BookOpen className="h-16 w-16 text-muted-foreground" />
                  <p className="text-lg">Open the full, distraction-free reading experience.</p>
                  <Button size="lg" onClick={() => window.open(`/bookmarks/${bookmark.id}`, "_blank")}>
                      Launch Reader Mode
                  </Button>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Reader mode is only available for articles.
                </div>
              )}
            </TabsContent>

            <TabsContent value="screenshot" className="mt-0 h-full flex flex-col items-center justify-center text-muted-foreground">
               <ImageIcon className="h-16 w-16 mb-4 opacity-50" />
               <p>Screenshot archival happens in the background.</p>
               <Button variant="outline" className="mt-4">
                  <Download className="h-4 w-4 mr-2" /> Download Full Screenshot
               </Button>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
