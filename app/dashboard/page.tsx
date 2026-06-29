export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="h-screen w-64 bg-black text-white p-6">
          <h1 className="text-3xl font-bold mb-10">Obatra</h1>

          <nav className="space-y-3">
            <button className="w-full rounded-lg p-3 text-left hover:bg-gray-800">
              🤖 AI Chat
            </button>

            <button className="w-full rounded-lg p-3 text-left hover:bg-gray-800">
              ✍️ AI Writer
            </button>

            <button className="w-full rounded-lg p-3 text-left hover:bg-gray-800">
              🖼️ AI Images
            </button>

            <button className="w-full rounded-lg p-3 text-left hover:bg-gray-800">
              📄 PDF AI
            </button>

            <button className="w-full rounded-lg p-3 text-left hover:bg-gray-800">
              ⚙️ Settings
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <section className="flex-1 p-10">
          <h2 className="text-4xl font-bold">
            Welcome to Obatra 👋
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Select an AI tool from the left menu to start working.
          </p>

          <div className="mt-10 rounded-2xl bg-white p-8 shadow">
            <h3 className="text-2xl font-semibold">
              Your AI Workspace
            </h3>

            <p className="mt-3 text-gray-500">
              Soon you'll be able to write content, generate images,
              summarize PDFs and chat with AI from here.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}