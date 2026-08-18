"use client";

import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight text-gray-900"
          >
            Obatra
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </nav>

      <section className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Contact Sales
            </p>

            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              Let&apos;s talk about Obatra
            </h1>

            <p className="mt-5 text-lg leading-8 text-gray-600">
              Have questions about Obatra for your team or business?
              Send us a message and we&apos;ll get back to you.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                💬
              </div>

              <h2 className="mt-6 text-xl font-bold text-gray-900">
                General Questions
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                Ask us anything about Obatra, our AI tools, or how the
                platform works.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                🚀
              </div>

              <h2 className="mt-6 text-xl font-bold text-gray-900">
                Business
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                Interested in using Obatra for a team, company, or larger
                workspace? Tell us what you need.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                ⚡
              </div>

              <h2 className="mt-6 text-xl font-bold text-gray-900">
                Need Help?
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                Having an issue with Obatra? Send us the details and we can
                help you understand what to do next.
              </p>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
            {sent ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl">
                  ✓
                </div>

                <h2 className="mt-6 text-2xl font-bold text-gray-900">
                  Message received!
                </h2>

                <p className="mt-3 text-gray-600">
                  Thanks for contacting Obatra. Your message has been
                  submitted successfully.
                </p>

                <button
                  onClick={() => setSent(false)}
                  className="mt-6 font-semibold text-blue-600 hover:text-blue-700"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900">
                  Send us a message
                </h2>

                <p className="mt-2 text-gray-600">
                  Fill in the form below and tell us how we can help.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Your name"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Email
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Message
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      placeholder="How can we help?"
                      className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-700"
                  >
                    Send Message
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
