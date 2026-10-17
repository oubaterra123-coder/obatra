import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/blog-posts";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    return { title: "Article Not Found | Obatra" };
  }

  const url = `https://obatra.vercel.app/blog/${post.slug}`;

  return {
    title: `${post.title} | Obatra Blog`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: `${post.publishedAt}T12:00:00.000Z`,
      siteName: "Obatra",
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) notFound();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5">
          <Link href="/" className="text-xl font-bold tracking-tight">
            OBATRA
          </Link>
          <Link
            href="/blog"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            All articles
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 pb-20 pt-12 sm:pt-20">
        <Link
          href="/blog"
          className="text-sm text-emerald-400 hover:text-emerald-300"
        >
          ← Back to blog
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
            {post.category}
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            {post.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-4 border-b border-white/10 pb-8 text-sm text-slate-400">
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt + "T12:00:00").toLocaleDateString(
                "en-US",
                { year: "numeric", month: "long", day: "numeric" }
              )}
            </time>
            <span>{post.readTime}</span>
          </div>
        </div>

        <div className="mt-10 space-y-10">
          {post.content.map((section, index) => (
            <section key={`${post.slug}-${index}`}>
              <h2 className="text-2xl font-bold leading-snug">
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4 text-base leading-8 text-slate-300">
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph}</p>
                ))}
              </div>
              {section.bullets && (
                <ul className="mt-5 list-disc space-y-2 pl-6 leading-7 text-slate-300">
                  {section.bullets.map((bullet, bulletIndex) => (
                    <li key={bulletIndex}>{bullet}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6 sm:p-8">
          <h2 className="text-2xl font-bold">Explore Obatra AI</h2>
          <p className="mt-3 leading-7 text-slate-300">
            Discover AI tools designed to help with writing, document analysis,
            summarization, translation, and everyday productivity.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Explore Obatra
          </Link>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <Link
            href="/blog"
            className="font-semibold text-emerald-400 hover:text-emerald-300"
          >
            ← Read more articles
          </Link>
        </div>
      </article>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} Obatra AI. All rights reserved.
      </footer>
    </main>
  );
}
