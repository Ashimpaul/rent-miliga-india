import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, User, Share2, AlertCircle, PlayCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  video_url: string | null;
  author: string | null;
  created_at: string;
}

const Blogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data, error } = await supabase
          .from("blogs")
          .select("id, title, slug, content, excerpt, image_url, video_url, author, created_at, is_published")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase error fetching blogs:", error);
          setError(error.message);
        } else {
          setBlogs(data || []);
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleShare = async (blog: Blog) => {
    const url = `${window.location.origin}/blog/${blog.slug}`;
    const shareData: any = {
      title: blog.title,
      text: blog.excerpt || "Check out this blog post!",
      url: url,
    };

    try {
      if (blog.image_url && navigator.canShare && (navigator as any).canShare({ files: [new File([], "test.jpg", { type: "image/jpeg" })] })) {
        try {
          const response = await fetch(blog.image_url, { mode: 'cors', cache: 'no-cache' });
          const blob = await response.blob();
          const file = new File([blob], `${blog.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`, { type: "image/jpeg" });
          if ((navigator as any).canShare({ files: [file] })) {
            await navigator.share({
              ...shareData,
              files: [file]
            });
            return;
          }
        } catch (fileErr) {
          console.error("Error preparing image for share:", fileErr);
        }
      }

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Error sharing:", err);
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 overflow-x-hidden">
        <div className="max-w-4xl mx-auto space-y-16 md:space-y-24">
          {loading ? (
            <div className="space-y-12">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="h-8 bg-muted rounded w-3/4 mx-auto md:mx-0" />
                  <div className="h-4 bg-muted rounded w-1/4 mx-auto md:mx-0" />
                  <div className="aspect-video bg-muted rounded-2xl" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 md:py-20 bg-muted/50 rounded-2xl border border-dashed border-border px-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl md:text-2xl font-semibold mb-2">Error Loading Blogs</h2>
              <p className="text-muted-foreground mb-6 text-sm md:text-base">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          ) : blogs.length > 0 ? (
            blogs.map((blog) => (
              <article key={blog.id} className="animate-fade-up">
                <div className="mb-6 md:mb-8 text-center md:text-left">
                  <h2 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">
                    {blog.title}
                  </h2>
                  <div className="flex items-center justify-center md:justify-between flex-wrap gap-4 py-4 border-y border-border">
                    <div className="flex items-center flex-wrap justify-center gap-4 md:gap-6">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs md:text-sm font-medium">{blog.created_at ? format(new Date(blog.created_at), "MMMM d, yyyy") : "Recently"}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleShare(blog)} className="text-muted-foreground hover:text-primary h-8 text-xs md:text-sm">
                      <Share2 className="mr-2 h-4 w-4" /> Share
                    </Button>
                  </div>
                </div>

                {blog.image_url && (
                  <div className="mb-8 md:mb-10 rounded-xl md:rounded-2xl overflow-hidden shadow-md border border-border bg-muted aspect-video">
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                    />
                  </div>
                )}

                <div 
                  className="prose prose-base md:prose-lg max-w-none mb-8 md:mb-10 dark:prose-invert blog-content font-serif leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: blog.content || "" }}
                />

                <style>{`
                  .blog-content h1 { font-size: 2.25rem; font-weight: 900; margin-top: 2.5rem; margin-bottom: 1.25rem; letter-spacing: -0.02em; }
                  .blog-content h2 { font-size: 1.75rem; font-weight: 800; margin-top: 2rem; margin-bottom: 1rem; letter-spacing: -0.01em; border-left: 4px solid hsl(var(--primary)); padding-left: 1rem; }
                  .blog-content h3 { font-size: 1.25rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; }
                  .blog-content p { margin-bottom: 1.25rem; line-height: 1.7; color: hsl(var(--foreground) / 0.85); }
                  .blog-content ul { list-style-type: disc; padding-left: 1.25rem; margin-bottom: 1.25rem; }
                  .blog-content ol { list-style-type: decimal; padding-left: 1.25rem; margin-bottom: 1.25rem; }
                  .blog-content blockquote { font-style: italic; border-left: 4px solid hsl(var(--primary)); padding: 0.75rem 1.5rem; margin: 1.5rem 0; background: hsl(var(--primary) / 0.05); border-radius: 0 0.75rem 0.75rem 0; }
                  .blog-content img { max-width: 100%; height: auto; border-radius: 1rem; margin: 2rem auto; display: block; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
                  .blog-content a { color: hsl(var(--primary)); text-decoration: underline; font-weight: 600; }
                `}</style>

                {blog.video_url && (
                  <div className="mb-8 md:mb-10">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-4 text-primary">
                      <PlayCircle className="h-5 w-5 md:h-6 md:w-6" />
                      <h3 className="text-lg md:text-xl font-bold">Watch Related Video</h3>
                    </div>
                    <div className="aspect-video rounded-xl md:rounded-2xl overflow-hidden border border-border shadow-md">
                      <iframe
                        className="w-full h-full"
                        src={(blog.video_url || "").includes("youtube.com") || (blog.video_url || "").includes("youtu.be") 
                          ? blog.video_url!.replace("watch?v=", "embed/").split("&")[0] 
                          : blog.video_url || ""}
                        title="Blog video content"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-border flex justify-end items-center">
                  <div className="text-[10px] md:text-xs text-muted-foreground font-mono">
                    END OF POST
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="text-center py-20 bg-muted/30 rounded-2xl border border-border">
              <h2 className="text-2xl font-semibold text-muted-foreground mb-2">No blog posts found.</h2>
              <p className="text-muted-foreground mb-6">Check back later for new content!</p>
              <Button asChild variant="outline">
                <Link to="/admin">Go to Admin Panel</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blogs;
