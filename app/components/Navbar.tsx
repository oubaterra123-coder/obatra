export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold">
          <span className="text-blue-600">O</span>batra
        </h1>

        <div className="hidden gap-8 md:flex">
          <a href="#" className="hover:text-blue-600">
            Home
          </a>
          <a href="#" className="hover:text-blue-600">
            Features
          </a>
          <a href="#" className="hover:text-blue-600">
            Pricing
          </a>
          <a href="#" className="hover:text-blue-600">
            Contact
          </a>
        </div>

        <button className="rounded-xl bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700">
          Login
        </button>
      </div>
    </nav>
  );
}