import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, User, ArrowLeft, Share2 } from "lucide-react";
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
    const url = window.location.href;
    const shareData: any = {
      title: blog.title,
      text: blog.excerpt || "Check out this blog post!",
      url: url,
    };

    try {
      if (navigator.share) {
        // Try to share with image if possible
        if (blog.image_url && navigator.canShare && (navigator as any).canShare({ files: [] })) {
          try {
            const response = await fetch(blog.image_url);
            const blob = await response.blob();
            const file = new File([blob], "blog-post.jpg", { type: "image/jpeg" });
            if ((navigator as any).canShare({ files: [file] })) {
              shareData.files = [file];
            }
          } catch (fileErr) {
            console.error("Error preparing image for share:", fileErr);
          }
        }
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
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
    <div className="flex min-h-screen flex-col">
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
        <div className="mb-6 md:mb-8">
          <Link to="/blogs" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center mb-4 md:mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Posts
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight text-center md:text-left">{blog.title}</h1>
          <div className="flex items-center justify-center md:justify-between flex-wrap gap-4 py-4 border-y border-border">
            <div className="flex items-center flex-wrap justify-center gap-4 md:gap-6">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-xs md:text-sm font-medium">{blog.created_at ? format(new Date(blog.created_at), "MMMM d, yyyy") : "Recently"}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleShare} className="text-muted-foreground hover:text-primary h-8 text-xs md:text-sm">
              <Share2 className="mr-2 h-4 w-4" /> Share Post
            </Button>
          </div>
        </div>

        {blog.image_url && (
          <div className="mb-8 md:mb-12 rounded-xl md:rounded-2xl overflow-hidden shadow-lg border border-border bg-muted aspect-video">
            <img
              src={blog.image_url}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div 
          className="prose prose-base md:prose-lg max-w-none mb-8 md:mb-12 dark:prose-invert blog-content"
          dangerouslySetInnerHTML={{ __html: blog.content || "" }}
        />

        <style>{`
          .blog-content h1 { font-size: 2.25rem; font-weight: 800; margin-top: 2rem; margin-bottom: 1rem; }
          .blog-content h2 { font-size: 1.875rem; font-weight: 700; margin-top: 1.75rem; margin-bottom: 0.75rem; }
          .blog-content p { margin-bottom: 1.25rem; line-height: 1.75; }
          .blog-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.25rem; }
          .blog-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.25rem; }
          .blog-content img { max-width: 100%; height: auto; border-radius: 0.75rem; margin: 2rem auto; display: block; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
          .blog-content a { color: hsl(var(--primary)); text-decoration: underline; }
        `}</style>

        {blog.video_url && (
          <div className="mb-8 md:mb-12">
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-center md:text-left">Watch Video</h3>
            <div className="aspect-video rounded-xl md:rounded-2xl overflow-hidden border border-border shadow-lg">
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
          </div>
        )}

        <div className="mt-8 md:mt-16 pt-8 border-t border-border flex justify-end items-center">
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto h-10">
            <Link to="/blogs">View More Posts</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetail;
