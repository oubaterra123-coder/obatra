import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold">
          <span className="text-blue-600">O</span>batra
        </Link>

        <div className="hidden gap-8 md:flex">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>

          <a href="#features" className="hover:text-blue-600">
            Features
          </a>

          <a href="#pricing" className="hover:text-blue-600">
            Pricing
          </a>

          <Link href="/contact" className="hover:text-blue-600">
            Contact
          </Link>
        </div>

        <Link
          href="/login"
          className="rounded-xl bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
        >
          Login
        </Link>
      </div>
    </nav>
  );
}
