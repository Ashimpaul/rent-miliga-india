import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
/*
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import TiptapImage from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
*/
import { 
  Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, 
  List, ListOrdered, Heading1, Heading2, Type, 
  AlignLeft, AlignCenter, AlignRight, Undo, Redo,
  Image as ImageIcon, Plus, Edit, Trash2, Save, X, Globe, Lock, Loader2, AlertTriangle, Copy, CheckCircle2
} from "lucide-react";

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  video_url: string | null;
  author: string | null;
  is_published: boolean;
  created_at: string;
}

const AdminBlogManagement = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const [editingBlog, setEditingBlog] = useState<Partial<Blog> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  
  console.log("AdminBlogManagement render. editingBlog:", editingBlog?.title || "none");
  const [testStatus, setTestStatus] = useState<{
    listings: string;
    blogs: string;
    storage: string;
  } | null>(null);

  /*
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TiptapImage.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto mx-auto my-4 shadow-md',
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your blog content here...',
      }),
    ],
    content: editingBlog?.content || '',
    onUpdate: ({ editor }) => {
      setEditingBlog(prev => prev ? { ...prev, content: editor.getHTML() } : null);
    },
  });

  // Update editor content when editingBlog changes
  useEffect(() => {
    if (editor && editingBlog) {
      const currentContent = editor.getHTML();
      const targetContent = editingBlog.content || '';
      
      // Only update if the content is actually different to avoid cursor jumping
      if (currentContent !== targetContent && targetContent !== '<p></p>') {
        editor.commands.setContent(targetContent);
      }
    }
  }, [editingBlog?.id, !!editingBlog, editor]);
  */

  useEffect(() => {
    fetchBlogs();
  }, []);

  const runConnectionTest = async () => {
    setTestStatus({ listings: "testing...", blogs: "testing...", storage: "testing..." });
    
    // Test Listings Table
    const { error: listingsError } = await supabase.from("listings").select("id").limit(1);
    const listingsRes = listingsError ? `Failed: ${listingsError.message} (Code: ${listingsError.code})` : "Success!";
    
    // Test Blogs Table
    const { error: blogsError } = await supabase.from("blogs").select("id").limit(1);
    const blogsRes = blogsError ? `Failed: ${blogsError.message} (Code: ${blogsError.code})` : "Success!";
    
    // Test Storage
    const { error: storageError } = await supabase.storage.from("blog-media").list("", { limit: 1 });
    const storageRes = storageError ? `Failed: ${storageError.message}` : "Success!";
    
    setTestStatus({ listings: listingsRes, blogs: blogsRes, storage: storageRes });
    
    if (!blogsError && !storageError) {
      toast.success("All tests passed! You should be able to post now.");
    } else {
      toast.error("Some tests failed. Please check the Troubleshooting guide.");
    }
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching blogs:", error);
        if (error.code === "42P01") {
          setTableExists(false);
        } else {
          toast.error(`Error fetching blogs: ${error.message}`);
        }
      } else {
        setBlogs(data || []);
        setTableExists(true);
      }
    } catch (err) {
      console.error("Fetch blogs exception:", err);
      setTableExists(false);
    }
    setLoading(false);
  };

  const handleCreateNew = () => {
    setEditingBlog({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      image_url: "",
      video_url: "",
      author: "Admin",
      is_published: false,
    });
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
  };

  const togglePublish = async (blog: Blog) => {
    const { error } = await supabase
      .from("blogs")
      .update({ is_published: !blog.is_published })
      .eq("id", blog.id);

    if (error) {
      toast.error(`Failed to update status: ${error.message}`);
    } else {
      toast.success(blog.is_published ? "Post unpublished" : "Post published!");
      fetchBlogs();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;

    const { error } = await supabase.from("blogs").delete().eq("id", id);

    if (error) {
      toast.error("Error deleting blog");
    } else {
      toast.success("Blog deleted successfully");
      fetchBlogs();
    }
  };

  const handleSave = async () => {
    if (!editingBlog?.title || !editingBlog?.content) {
      toast.error("Please fill in at least title and content");
      return;
    }

    const finalSlug = editingBlog.slug || generateSlug(editingBlog.title);
    if (!finalSlug) {
      toast.error("A valid URL slug is required");
      return;
    }

    setIsSaving(true);
    
    const blogData: any = {
      title: editingBlog.title,
      slug: finalSlug,
      content: editingBlog.content,
      excerpt: editingBlog.excerpt || "",
      image_url: editingBlog.image_url || "",
      video_url: editingBlog.video_url || "",
      author: editingBlog.author || "Admin",
      is_published: editingBlog.is_published ?? false,
    };

    try {
      let error;
      if (editingBlog.id) {
        const { error: updateError } = await supabase
          .from("blogs")
          .update(blogData)
          .eq("id", editingBlog.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("blogs")
          .insert([blogData]);
        error = insertError;
      }

      if (error) {
        console.error("Supabase Database Error:", error);
        if (error.code === "23505") {
          toast.error("A blog post with this title or slug already exists.");
        } else if (error.code === "42P01") {
          setTableExists(false);
          toast.error("Database table 'blogs' not found.");
        } else {
          toast.error(`Error: ${error.message || "Failed to save blog post"}`);
        }
      } else {
        const message = editingBlog.id 
          ? "Blog updated successfully" 
          : editingBlog.is_published 
            ? "Blog created and published successfully!" 
            : "Blog created as a draft. Remember to check 'Publish Post' to make it public.";
        
        toast.success(message);
        setEditingBlog(null);
        fetchBlogs();
      }
    } catch (err: any) {
      console.error("Unexpected error during save:", err);
      toast.error(`Unexpected error: ${err.message || "An unknown error occurred"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isInline: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("blog-media")
        .upload(filePath, file);

      if (uploadError) {
        toast.error(`Upload failed: ${uploadError.message}`);
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from("blog-media")
          .getPublicUrl(filePath);
        
        if (isInline && editor) {
          editor.commands.setImage({ src: publicUrl });
          toast.success("Image inserted into blog");
        } else {
          setEditingBlog(prev => ({ ...prev, image_url: publicUrl }));
          toast.success("Featured image uploaded");
        }
      }
    } catch (err: any) {
      toast.error(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const MIGRATION_SQL = `-- 1. CREATE BLOGS TABLE
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image_url TEXT,
    video_url TEXT,
    author TEXT DEFAULT 'Admin',
    is_published BOOLEAN DEFAULT false
);

-- 2. ENABLE SECURITY
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- 3. ADD BLOG PERMISSIONS
DROP POLICY IF EXISTS "Allow select for everyone" ON public.blogs;
CREATE POLICY "Allow select for everyone" ON public.blogs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow insert for everyone" ON public.blogs;
CREATE POLICY "Allow insert for everyone" ON public.blogs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update for everyone" ON public.blogs;
CREATE POLICY "Allow update for everyone" ON public.blogs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow delete for everyone" ON public.blogs;
CREATE POLICY "Allow delete for everyone" ON public.blogs FOR DELETE TO anon, authenticated USING (true);

-- 4. CREATE STORAGE BUCKET (MANUAL STEP RECOMMENDED)
-- If this fails, create a public bucket named 'blog-media' in the Supabase Storage dashboard
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('blog-media', 'blog-media', true, 5242880, '{image/*}')
ON CONFLICT (id) DO UPDATE SET public = true;

-- 5. ADD STORAGE PERMISSIONS
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'blog-media');
DROP POLICY IF EXISTS "Insert Access" ON storage.objects;
CREATE POLICY "Insert Access" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'blog-media');
DROP POLICY IF EXISTS "Update Access" ON storage.objects;
CREATE POLICY "Update Access" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'blog-media') WITH CHECK (bucket_id = 'blog-media');
DROP POLICY IF EXISTS "Delete Access" ON storage.objects;
CREATE POLICY "Delete Access" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'blog-media');`;

  if (tableExists === false || showTroubleshoot) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center mb-2">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-amber-800 dark:text-amber-300">Database Setup Required</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            The <code>blogs</code> table or storage bucket was not found. Please follow these steps to fix it:
          </p>
          
          <div className="text-left max-w-2xl mx-auto space-y-6 mt-6">
            <div className="bg-card border border-border p-4 rounded-lg space-y-3">
              <h3 className="font-bold flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Connection Status
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Listings Table:</span>
                <span className={`font-mono ${testStatus?.listings === "Success!" ? "text-green-500" : "text-amber-500"}`}>
                  {testStatus?.listings || "Not tested"}
                </span>
                
                <span className="text-muted-foreground">Blogs Table:</span>
                <span className={`font-mono ${testStatus?.blogs === "Success!" ? "text-green-500" : "text-amber-500"}`}>
                  {testStatus?.blogs || "Not tested"}
                </span>
                
                <span className="text-muted-foreground">Media Storage:</span>
                <span className={`font-mono ${testStatus?.storage === "Success!" ? "text-green-500" : "text-amber-500"}`}>
                  {testStatus?.storage || "Not tested"}
                </span>
              </div>
              <Button size="sm" onClick={runConnectionTest} className="w-full mt-2">
                Run Connection Test
              </Button>
            </div>

            <div className="space-y-2">
              <p className="font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs">1</span>
                Copy the SQL below
              </p>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto border border-border max-h-60">
                  {MIGRATION_SQL}
                </pre>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="absolute top-2 right-2 h-8"
                  onClick={() => copyToClipboard(MIGRATION_SQL)}
                >
                  <Copy className="h-3 w-3 mr-2" /> Copy SQL
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs">2</span>
                Manual Bucket Creation (Highly Recommended)
              </p>
              <p className="text-sm text-muted-foreground">
                If the SQL above doesn't fix the <strong>Media Storage</strong> error, you must create it manually in the dashboard:
              </p>
              <ul className="text-sm list-disc list-inside space-y-1 text-muted-foreground ml-2 bg-muted/50 p-3 rounded-lg border border-border">
                <li>Go to <a href="https://supabase.com/dashboard/project/rqiadgxfeiuuvhpxmmpy/storage/buckets" target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline">Supabase Storage Dashboard</a></li>
                <li>Click <strong>New Bucket</strong></li>
                <li>Name it exactly: <code className="bg-primary/10 text-primary px-1 rounded">blog-media</code></li>
                <li>Set it to <strong>Public</strong> (important!)</li>
                <li>Click <strong>Save</strong></li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs">3</span>
                Run SQL Migration
              </p>
              <p className="text-sm text-muted-foreground">
                Ensure the database table exists by running this in the <a href="https://supabase.com/dashboard/project/rqiadgxfeiuuvhpxmmpy/sql/new" target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold">SQL Editor</a>:
              </p>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto border border-border max-h-60">
                  {MIGRATION_SQL}
                </pre>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="absolute top-2 right-2 h-8"
                  onClick={() => copyToClipboard(MIGRATION_SQL)}
                >
                  <Copy className="h-3 w-3 mr-2" /> Copy SQL
                </Button>
              </div>
            </div>

            <div className="pt-4 flex justify-center gap-4">
              <Button onClick={fetchBlogs}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> I've done both, check again
              </Button>
              <Button variant="ghost" onClick={() => setShowTroubleshoot(false)}>
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (editingBlog) {
    return (
      <div key={editingBlog.id || "new-post"} className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm space-y-6 animate-fade-up">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-lg md:text-xl font-bold">{editingBlog.id ? "Edit Blog Post" : "New Blog Post"}</h2>
          <Button variant="ghost" size="sm" onClick={() => setEditingBlog(null)} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input 
                value={editingBlog.title || ""} 
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setEditingBlog(prev => ({ 
                    ...prev, 
                    title: newTitle,
                    slug: prev?.id ? prev.slug : generateSlug(newTitle)
                  }));
                }}
                placeholder="Blog title"
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug (URL path)</label>
              <Input 
                value={editingBlog.slug || ""} 
                onChange={(e) => setEditingBlog(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="blog-post-url"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Author</label>
              <Input 
                value={editingBlog.author || ""} 
                onChange={(e) => setEditingBlog(prev => ({ ...prev, author: e.target.value }))}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Excerpt (Short Summary)</label>
              <Textarea 
                value={editingBlog.excerpt || ""} 
                onChange={(e) => setEditingBlog(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="A brief summary of the post..."
                className="h-20 text-sm"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Featured Image</label>
              <div className="flex gap-2">
                <Input 
                  value={editingBlog.image_url || ""} 
                  onChange={(e) => setEditingBlog(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="Image URL or upload below"
                  className="h-10 text-sm"
                />
              </div>
              <div className="mt-2">
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  disabled={uploading}
                  className="cursor-pointer text-xs h-9 py-1"
                />
                {uploading && <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Uploading...</p>}
              </div>
              {editingBlog.image_url && (
                <div className="mt-2 aspect-video rounded-lg overflow-hidden border border-border bg-muted max-w-[200px] md:max-w-full mx-auto md:mx-0">
                  <img src={editingBlog.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Video URL (Optional)</label>
              <Input 
                value={editingBlog.video_url || ""} 
                onChange={(e) => setEditingBlog(prev => ({ ...prev, video_url: e.target.value }))}
                placeholder="YouTube or Vimeo URL"
                className="h-10 text-sm"
              />
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between mt-4">
              <div className="space-y-0.5">
                <label htmlFor="is_published" className="text-sm font-bold flex items-center gap-2 cursor-pointer">
                  <Globe className="h-4 w-4 text-primary" />
                  Publish Post
                </label>
                <p className="text-[10px] text-muted-foreground">Make this post visible to everyone.</p>
              </div>
              <input 
                type="checkbox" 
                id="is_published"
                checked={editingBlog.is_published || false}
                onChange={(e) => setEditingBlog(prev => ({ ...prev, is_published: e.target.checked }))}
                className="h-6 w-6 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Content (HTML Support)</label>
          <Textarea 
            value={editingBlog.content || ""} 
            onChange={(e) => setEditingBlog(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Write your blog content here. You can use HTML tags like <b>, <i>, <h1>, <img src='...'> etc."
            className="min-h-[400px] font-mono text-sm leading-relaxed"
          />
          <p className="text-[10px] text-muted-foreground italic">
            Note: Rich text editor is temporarily disabled to ensure stability. You can still use HTML.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => setEditingBlog(null)} className="w-full sm:w-auto">Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Post</>}
          </Button>
        </div>
      </div>
    );
  }

  const unpublishedCount = blogs.filter(b => !b.is_published).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Manage Blog Posts</h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
            <Link to="/blogs" target="_blank">
              <Globe className="mr-1.5 h-3.5 w-3.5" /> View Blog
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowTroubleshoot(true)} className="flex-1 sm:flex-none">
            Fix Issues
          </Button>
          <Button onClick={handleCreateNew} size="sm" className="w-full sm:w-auto">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> New Post
          </Button>
        </div>
      </div>

      {blogs.length > 0 && unpublishedCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 md:p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs md:text-sm">
            <p className="font-bold text-amber-800 dark:text-amber-300">
              You have {unpublishedCount} unpublished post{unpublishedCount > 1 ? 's' : ''}
            </p>
            <p className="text-amber-700/80 dark:text-amber-400/80">
              Posts marked as "Draft" are hidden. Click the lock icon to publish.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : blogs.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-card border border-border rounded-xl p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded bg-muted overflow-hidden flex-shrink-0">
                  {blog.image_url ? (
                    <img src={blog.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm md:text-base line-clamp-1">{blog.title}</h3>
                  <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-muted-foreground mt-0.5">
                    <span>{format(new Date(blog.created_at), "MMM d, yyyy")}</span>
                    <button 
                      onClick={() => togglePublish(blog)}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full transition-colors ${
                        blog.is_published 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                      title={blog.is_published ? "Click to unpublish" : "Click to publish"}
                    >
                      {blog.is_published ? (
                        <><Globe className="h-2.5 w-2.5" /> Published</>
                      ) : (
                        <><Lock className="h-2.5 w-2.5" /> Draft</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-1 md:gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
                <Button variant="ghost" size="icon" asChild title="View Public Post" className="h-8 w-8">
                  <Link to={`/blog/${blog.slug}`}>
                    <Globe className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(blog)} title="Edit Post" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(blog.id)} title="Delete Post">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">No blog posts yet. Create your first one!</p>
          <Button variant="outline" className="mt-4" onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" /> Create Blog Post
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminBlogManagement;
