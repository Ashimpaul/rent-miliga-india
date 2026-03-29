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

  const handleShare = (blog: Blog) => {
    const url = `${window.location.origin}/blog/${blog.slug}`;
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt || "Check out this blog post!",
        url: url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Our Blog</h1>
          <p className="text-muted-foreground text-lg md:text-xl">
            Latest news, updates, and rental tips from the RentMilega team.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-24">
          {loading ? (
            <div className="space-y-12">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="h-8 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="aspect-video bg-muted rounded-2xl" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-muted/50 rounded-2xl border border-dashed border-border">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Error Loading Blogs</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          ) : blogs.length > 0 ? (
            blogs.map((blog) => (
              <article key={blog.id} className="animate-fade-up">
                <div className="mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                    {blog.title}
                  </h2>
                  <div className="flex items-center justify-between flex-wrap gap-4 py-4 border-y border-border">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{format(new Date(blog.created_at), "MMMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{blog.author || "Admin"}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleShare(blog)} className="text-muted-foreground hover:text-primary">
                      <Share2 className="mr-2 h-4 w-4" /> Share
                    </Button>
                  </div>
                </div>

                {blog.image_url && (
                  <div className="mb-10 rounded-2xl overflow-hidden shadow-md border border-border bg-muted aspect-video">
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                    />
                  </div>
                )}

                <div className="prose prose-lg max-w-none mb-10 dark:prose-invert">
                  {blog.content.split("\n").map((para, i) => (
                    para.trim() ? <p key={i}>{para}</p> : <br key={i} />
                  ))}
                </div>

                {blog.video_url && (
                  <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4 text-primary">
                      <PlayCircle className="h-6 w-6" />
                      <h3 className="text-xl font-bold">Watch Related Video</h3>
                    </div>
                    <div className="aspect-video rounded-2xl overflow-hidden border border-border shadow-md">
                      <iframe
                        className="w-full h-full"
                        src={blog.video_url.includes("youtube.com") || blog.video_url.includes("youtu.be") 
                          ? blog.video_url.replace("watch?v=", "embed/").split("&")[0] 
                          : blog.video_url}
                        title="Blog Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                <div className="mt-12 pt-8 border-t border-border flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                      {blog.author?.[0] || "A"}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{blog.author || "Admin"}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Editor</p>
                    </div>
                  </div>
                  <div className="h-px bg-border flex-1 mx-8 hidden sm:block" />
                  <div className="text-xs text-muted-foreground font-mono">
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
