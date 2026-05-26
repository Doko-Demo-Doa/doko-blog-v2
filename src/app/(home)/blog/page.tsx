import { PathUtils } from "fumadocs-core/source";
import type { Metadata } from "next";
import Link from "next/link";
import { blog } from "@/lib/source";

function getName(path: string) {
  return PathUtils.basename(path, PathUtils.extname(path));
}

export const metadata: Metadata = {
  title: "Doko's Blog",
  description: "Something, something",
};

export default function BlogPage() {
  const posts = [...blog.getPages()].sort(
    (a, b) =>
      new Date(b.data.date ?? getName(b.path)).getTime() -
      new Date(a.data.date ?? getName(a.path)).getTime(),
  );

  return (
    <main className="container mx-auto w-full max-w-page px-4 pb-12 md:py-12">
      <div className="relative mb-4 aspect-[3.2] rounded-2xl overflow-hidden bg-gradient-to-br from-fd-primary/20 via-fd-muted/30 to-fd-card p-8 md:p-12">
        <div className="absolute inset-0 -z-1 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-fd-primary/10 via-transparent to-transparent" />
        <div className="absolute inset-0 -z-1 bg-[linear-gradient(135deg,rgba(0,0,0,0.05),transparent_50%)] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_50%)]" />
        <h1 className="mb-4 text-3xl font-mono font-medium text-fd-foreground">
          {"Doko's Blog"}
        </h1>
        <p className="text-sm font-mono text-fd-muted-foreground">
          Thoughts, tutorials, and explorations.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3 xl:grid-cols-4">
        {posts.map((post) => (
          <Link
            key={post.url}
            href={post.url}
            className="flex flex-col bg-fd-card rounded-2xl border shadow-sm p-4 transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
          >
            <p className="font-medium">{post.data.title}</p>
            <p className="text-sm text-fd-muted-foreground">
              {post.data.description}
            </p>

            <p className="mt-auto pt-4 text-xs text-fd-muted-foreground">
              {new Date(post.data.date ?? getName(post.path)).toDateString()}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
