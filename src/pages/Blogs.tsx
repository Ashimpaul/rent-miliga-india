
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, User, Share2, AlertCircle, PlayCircle, ArrowLeft, Menu, X, BookOpen, Clock } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { optimizeImage } from "@/lib/utils";

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
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { slug } = useParams();
  const navigate = useNavigate();

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
          
          // Auto-select blog from URL or first blog
          if (slug && data) {
            const blogFromSlug = data.find(b => b.slug === slug);
            if (blogFromSlug) {
              setSelectedBlog(blogFromSlug);
            } else if (data.length > 0) {
              setSelectedBlog(data[0]);
              navigate(`/blogs/${data[0].slug}`, { replace: true });
            }
          } else if (data && data.length > 0) {
            setSelectedBlog(data[0]);
            navigate(`/blogs/${data[0].slug}`, { replace: true });
          }
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [slug, navigate]);

  const handleBlogSelect = (blog: Blog) => {
    setSelectedBlog(blog);
    navigate(`/blogs/${blog.slug}`);
    setSidebarOpen(false);
  };

  const handleShare = async (blog: Blog) => {
    const url = `https://rentmilega.in/blog/${blog.slug}`;
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

  // Blog Sidebar Component
  const BlogSidebar = () => (
    <div className="flex flex-col h-full bg-background">
      <div className="p-6 border-b border-border/40 bg-gradient-to-b from-card/70 to-background">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-full">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-bold tracking-tight">Blog Library</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          {blogs.length} articles to explore
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto py-3">
        {blogs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground text-sm">No posts yet</p>
          </div>
        ) : (
          <div className="px-3 space-y-2">
            {blogs.map((blog) => (
              <button
                key={blog.id}
                onClick={() => handleBlogSelect(blog)}
                className={`w-full text-left px-4 py-4 rounded-xl transition-all duration-200 group ${
                  selectedBlog?.id === blog.id 
                    ? 'bg-primary/10 text-primary shadow-sm' 
                    : 'text-foreground/85 hover:bg-accent/40'
                }`}
              >
                <div className="flex gap-4">
                  {blog.image_url && (
                    <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={optimizeImage(blog.image_url, 200, undefined, 80)}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold leading-snug line-clamp-2 mb-2">
                      {blog.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <span className="text-[11px] text-muted-foreground/80">
                        {blog.created_at ? format(new Date(blog.created_at), "MMMM d, yyyy") : "Recently"}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Blog Detail Component
  const BlogDetail = ({ blog }: { blog: Blog }) => (
    <article className="max-w-3xl mx-auto px-4 py-10 md:py-16">
      <div className="animate-fade-up">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-3 mb-6">
            {/* Mobile: Open Sidebar Button */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="sm" className="rounded-full">
                  <Menu className="h-4 w-4 mr-2" />
                  Posts
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[70%] sm:w-[240px] p-0">
                <BlogSidebar />
              </SheetContent>
            </Sheet>
            
            {/* Desktop: Back Button */}
            <Button variant="outline" size="sm" asChild className="hidden md:flex rounded-full">
              <Link to="/blogs" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            
            <Button variant="ghost" size="sm" onClick={() => handleShare(blog)} className="rounded-full">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-6 leading-[1.1]">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 py-3 border-y border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-xs font-medium">{blog.author || "RentMilega Team"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {blog.created_at ? format(new Date(blog.created_at), "MMMM d, yyyy") : "Recently"}
              </span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {blog.image_url && (
          <div className="mb-10 md:mb-14 rounded-2xl overflow-hidden border border-border/50">
            <img
              src={optimizeImage(blog.image_url, 1400, undefined, 85)}
              alt={blog.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        )}

        {/* Content */}
        <div 
          className="prose prose-sm md:prose-base lg:prose-lg max-w-none mb-10 md:mb-14 dark:prose-invert blog-content leading-relaxed"
          dangerouslySetInnerHTML={{ __html: blog.content || "" }}
        />

        {/* Video */}
        {blog.video_url && (
          <div className="mb-10 md:mb-14">
            <div className="flex items-center gap-2 mb-4 text-primary/80">
              <PlayCircle className="h-5 w-5" />
              <h3 className="text-sm font-bold">Watch Video</h3>
            </div>
            <div className="aspect-video rounded-xl overflow-hidden border border-border/50">
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

        {/* End of Post */}
        <div className="pt-8 border-t border-border/30 text-center">
          <div className="text-[10px] text-muted-foreground/60 font-mono tracking-widest uppercase">
            End of Article
          </div>
        </div>
      </div>

      {/* Blog Content Styles */}
      <style>{`
        .blog-content h1 { font-size: 2rem; font-weight: 900; margin-top: 2rem; margin-bottom: 1rem; letter-spacing: -0.02em; }
        .blog-content h2 { font-size: 1.5rem; font-weight: 800; margin-top: 1.75rem; margin-bottom: 0.75rem; letter-spacing: -0.01em; border-left: 3px solid hsl(var(--primary)); padding-left: 0.875rem; }
        .blog-content h3 { font-size: 1.125rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.5rem; }
        .blog-content p { margin-bottom: 1rem; line-height: 1.75; color: hsl(var(--foreground) / 0.85); }
        .blog-content ul { list-style-type: disc; padding-left: 1.25rem; margin-bottom: 1rem; }
        .blog-content ol { list-style-type: decimal; padding-left: 1.25rem; margin-bottom: 1rem; }
        .blog-content blockquote { font-style: italic; border-left: 3px solid hsl(var(--primary)); padding: 0.625rem 1.25rem; margin: 1.25rem 0; background: hsl(var(--primary) / 0.04); border-radius: 0 0.625rem 0.625rem 0; }
        .blog-content img { max-width: 100%; height: auto; border-radius: 0.75rem; margin: 1.5rem auto; display: block; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
        .blog-content a { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 2px; font-weight: 600; }
      `}</style>
    </article>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 md:py-12 overflow-x-hidden">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 md:py-12 overflow-x-hidden">
          <div className="text-center py-12 md:py-20 bg-muted/30 rounded-2xl border border-dashed border-border/50 px-4">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
            <h2 className="text-lg md:text-xl font-semibold mb-2">Error Loading Blogs</h2>
            <p className="text-muted-foreground mb-6 text-sm">{error}</p>
            <Button onClick={() => window.location.reload()} size="sm">Try Again</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 overflow-hidden">
        <div className="flex h-[calc(100vh-70px)] md:h-auto">
          {/* Desktop Sidebar */}
          <aside className="hidden md:flex md:w-80 lg:w-96 flex-col border-r border-border/40 bg-background/95 h-full overflow-y-auto sticky top-0">
            <BlogSidebar />
          </aside>

          {/* Main Content */}
          <section className="flex-1 overflow-y-auto bg-background/50">
            {selectedBlog ? (
              <BlogDetail blog={selectedBlog} />
            ) : (
              <div className="flex items-center justify-center h-[60vh] text-center px-4">
                <div>
                  <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <h2 className="text-xl font-bold mb-2 text-foreground/70">Select a Post</h2>
                  <p className="text-muted-foreground text-sm">Choose from the sidebar</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blogs;
