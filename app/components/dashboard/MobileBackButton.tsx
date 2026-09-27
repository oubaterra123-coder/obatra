"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function MobileBackButton() {
 const router = useRouter();
 const pathname = usePathname();

 if (pathname === "/dashboard") return null;

 return (
 <button
 onClick={() => router.back()}
 className="lg:hidden fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md border border-gray-200"
 aria-label="Go back"
 >
 <ArrowLeft size={20} />
 </button>
 );
}
