import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog?.title,
        text: blog?.excerpt || "Check out this blog post!",
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
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
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <Link to="/blogs" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Posts
          </Link>
          <h1 className="text-4xl font-extrabold mb-4 leading-tight">{blog.title}</h1>
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
            <Button variant="ghost" size="sm" onClick={handleShare} className="text-muted-foreground hover:text-primary">
              <Share2 className="mr-2 h-4 w-4" /> Share Post
            </Button>
          </div>
        </div>

        {blog.image_url && (
          <div className="mb-12 rounded-2xl overflow-hidden shadow-lg border border-border bg-muted aspect-video">
            <img
              src={blog.image_url}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none mb-12 dark:prose-invert">
          {blog.content.split("\n").map((para, i) => (
            para.trim() ? <p key={i}>{para}</p> : <br key={i} />
          ))}
        </div>

        {blog.video_url && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-4">Watch Video</h3>
            <div className="aspect-video rounded-2xl overflow-hidden border border-border shadow-lg">
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

        <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
              {blog.author?.[0] || "A"}
            </div>
            <div>
              <p className="font-bold">{blog.author || "Admin"}</p>
              <p className="text-xs text-muted-foreground">Editor & Contributor</p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link to="/blogs">View More Posts</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetail;
