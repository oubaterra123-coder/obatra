import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "AI Blog: Guides, Tools & Productivity Tips | Obatra",
  description:
    "Explore practical AI guides, productivity tips, writing techniques, and document analysis tutorials from the Obatra AI blog.",
  alternates: {
    canonical: "https://obatra.vercel.app/blog",
  },
  openGraph: {
    title: "Obatra AI Blog",
    description:
      "Practical guides to AI tools, productivity, writing, and document analysis.",
    url: "https://obatra.vercel.app/blog",
    type: "website",
  },
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link href="/" className="text-xl font-bold tracking-tight">
            OBATRA
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-14 pt-16 sm:pt-24">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
          The Obatra Blog
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
          Practical AI guides for better work
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Discover helpful guides on AI tools, writing, productivity, and
          document analysis. Learn practical techniques you can use every day.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Latest articles</h2>
          <span className="text-sm text-slate-400">
            {blogPosts.length} articles
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-emerald-400/40 hover:bg-white/[0.05]"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                {post.category}
              </p>
              <h3 className="mt-4 text-xl font-bold leading-snug">
                <Link
                  href={`/blog/${post.slug}`}
                  className="transition hover:text-emerald-300"
                >
                  {post.title}
                </Link>
              </h3>
              <p className="mt-3 flex-1 leading-7 text-slate-300">
                {post.description}
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400">
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt + "T12:00:00").toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "short", day: "numeric" }
                  )}
                </time>
                <span>{post.readTime}</span>
              </div>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-5 inline-flex items-center font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Read article <span className="ml-2" aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} Obatra AI. All rights reserved.
      </footer>
    </main>
  );
}
