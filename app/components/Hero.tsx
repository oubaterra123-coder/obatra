export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-24 md:pb-28 md:pt-28">
      <div className="mx-auto max-w-5xl text-center">

        <div className="mb-6 inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
          AI tools. One simple workspace.
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl">
          Everything You Need to
          <br />
          <span className="text-blue-600">Create With AI</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 md:text-xl">
          Chat, write, create images, analyze PDFs, and translate —
          all in one powerful AI workspace.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#features"
            className="rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl"
          >
            Explore Obatra →
          </a>

          <a
            href="#pricing"
            className="rounded-xl border border-gray-300 bg-white px-7 py-3.5 font-semibold text-gray-800 transition hover:border-blue-300 hover:text-blue-600"
          >
            View Pricing
          </a>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 text-left sm:grid-cols-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="font-semibold">💬 AI Chat</p>
            <p className="mt-1 text-sm text-gray-500">Ask anything</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="font-semibold">✍️ AI Writer</p>
            <p className="mt-1 text-sm text-gray-500">Create content</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="font-semibold">🖼️ AI Images</p>
            <p className="mt-1 text-sm text-gray-500">Create visuals</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="font-semibold">📄 PDF AI</p>
            <p className="mt-1 text-sm text-gray-500">Analyze PDFs</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="font-semibold">🌐 Translator</p>
            <p className="mt-1 text-sm text-gray-500">Translate text</p>
          </div>
        </div>

      </div>
    </section>
  );
}
