import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, User, ArrowLeft, Share2, Clock, BookOpen, ChevronRight, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error) {
        console.error("Error fetching blog:", error);
      } else {
        setBlog(data);
      }
      setLoading(false);
    };

    if (slug) fetchBlog();
  }, [slug]);

  const handleShare = async () => {
    if (!blog) return;
    const url = `https://rentmilega.in/blog/${blog.slug}`;
    const shareData: any = {
      title: blog.title,
      text: blog.excerpt || "Check out this blog post!",
      url: url,
    };

    try {
      // Check if we can share files
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

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
          <div className="h-8 bg-muted animate-pulse rounded w-3/4 mb-4" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/4 mb-8" />
          <div className="aspect-video bg-muted animate-pulse rounded-xl mb-12" />
          <div className="space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="text-muted-foreground mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/blogs">Back to Blog</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Helmet>
        <title>{blog.title} | RentMilega Blog</title>
        <meta name="description" content={blog.excerpt || blog.title} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={`${blog.title} | RentMilega Blog`} />
        <meta property="og:description" content={blog.excerpt || blog.title} />
        <meta property="og:image" content={blog.image_url || "https://rentmilega.in/logo.png"} />
        <meta property="og:image:secure_url" content={blog.image_url || "https://rentmilega.in/logo.png"} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="RentMilega" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={window.location.href} />
        <meta name="twitter:title" content={`${blog.title} | RentMilega Blog`} />
        <meta name="twitter:description" content={blog.excerpt || blog.title} />
        <meta name="twitter:image" content={blog.image_url || "https://rentmilega.in/logo.png"} />
        <meta name="twitter:image:alt" content={blog.title} />

        {/* Schema.org for Google+ / Pinterest */}
        <meta itemprop="name" content={blog.title} />
        <meta itemprop="description" content={blog.excerpt || ""} />
        <meta itemprop="image" content={blog.image_url || "https://rentmilega.in/logo.png"} />
      </Helmet>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl overflow-x-hidden">
        <div className="animate-fade-up mb-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/blogs" className="hover:text-primary transition-colors">Blog</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate font-medium">{blog.title}</span>
          </nav>
          
          <div className="space-y-4 text-center md:text-left">
            <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-none font-bold uppercase tracking-widest text-[10px]">
              Rental Guide
            </Badge>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 leading-[1.1] tracking-tight text-foreground">{blog.title}</h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8 pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Author</p>
                  <p className="text-sm font-bold">{blog.author || "RentMilega Team"}</p>
                </div>
              </div>
              
              <Separator orientation="vertical" className="hidden md:block h-8" />
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Published</p>
                  <p className="text-sm font-bold">{blog.created_at ? format(new Date(blog.created_at), "MMMM d, yyyy") : "Recently"}</p>
                </div>
              </div>

              <div className="flex-1 flex justify-center md:justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleShare} 
                  className="rounded-full bg-background shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                  <Share2 className="mr-2 h-4 w-4 text-primary" /> Share Post
                </Button>
              </div>
            </div>
          </div>
        </div>

        {blog.image_url && (
          <div className="animate-fade-up mb-10 md:mb-16 rounded-3xl overflow-hidden shadow-2xl border border-border bg-muted aspect-video ring-1 ring-primary/5">
            <img
              src={blog.image_url}
              alt={blog.title}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        )}

        <div className="animate-fade-up max-w-3xl mx-auto">
          <div 
            className="prose prose-base md:prose-lg max-w-none mb-12 dark:prose-invert blog-content font-serif leading-relaxed"
            dangerouslySetInnerHTML={{ __html: blog.content || "" }}
          />
        </div>

        <style>{`
          .blog-content h1 { font-size: 2.5rem; font-weight: 900; margin-top: 3rem; margin-bottom: 1.5rem; letter-spacing: -0.02em; }
          .blog-content h2 { font-size: 2rem; font-weight: 800; margin-top: 2.5rem; margin-bottom: 1rem; letter-spacing: -0.01em; border-left: 4px solid hsl(var(--primary)); padding-left: 1rem; }
          .blog-content h3 { font-size: 1.5rem; font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; }
          .blog-content p { margin-bottom: 1.5rem; line-height: 1.8; color: hsl(var(--foreground) / 0.9); }
          .blog-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; }
          .blog-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.5rem; }
          .blog-content blockquote { font-style: italic; border-left: 4px solid hsl(var(--primary)); padding: 1rem 2rem; margin: 2rem 0; background: hsl(var(--primary) / 0.05); border-radius: 0 1rem 1rem 0; }
          .blog-content img { max-width: 100%; height: auto; border-radius: 1.5rem; margin: 3rem auto; display: block; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }
          .blog-content a { color: hsl(var(--primary)); text-decoration: underline; font-weight: 600; }
        `}</style>

        {blog.video_url && (
          <div className="animate-fade-up mb-16 max-w-3xl mx-auto">
            <h3 className="text-2xl font-black mb-6 text-center md:text-left flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" /> Watch Video Content
            </h3>
            <Card className="overflow-hidden rounded-3xl border-none shadow-2xl ring-1 ring-primary/5">
              <div className="aspect-video">
                <iframe
                  className="w-full h-full"
                  src={(blog.video_url || "").includes("youtube.com") || (blog.video_url || "").includes("youtu.be") 
                    ? blog.video_url!.replace("watch?v=", "embed/").split("&")[0] 
                    : (blog.video_url || "").includes("vimeo.com")
                      ? `https://player.vimeo.com/video/${blog.video_url!.split("/").pop()}`
                      : blog.video_url || ""}
                  title="Blog video content"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </Card>
          </div>
        )}

        <div className="animate-fade-up mt-16 pt-12 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="font-black">RentMilega Blog</p>
              <p className="text-sm text-muted-foreground font-medium">Helping you find the perfect home.</p>
            </div>
          </div>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-full font-bold shadow-sm hover:shadow-md transition-all active:scale-95">
            <Link to="/blogs">Explore More Articles</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetail;
