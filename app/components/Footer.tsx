import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-extrabold text-gray-900">Obatra</p>
          <p className="mt-1 text-sm text-gray-500">
            One AI Workspace for Your Business
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-gray-600">
          <Link href="/privacy" className="hover:text-blue-600">
            Privacy Policy
          </Link>

          <Link href="/terms" className="hover:text-blue-600">
            Terms of Service
          </Link>

          <Link href="/contact" className="hover:text-blue-600">
            Contact
          </Link>
        </div>

        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} Obatra. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
