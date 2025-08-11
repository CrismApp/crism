"use client";
import { Marketplace } from "@/components/marketplace";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MarketplacePage() {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="grid lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-orange-500/20 bg-gray-900/50 backdrop-blur">
          <div className="flex h-16 items-center gap-2 border-b border-orange-500/20 px-6">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg"></div>
            <span className="font-bold">Prism</span>
          </div>
          <nav className="space-y-2 px-2 mt-4">
            <Button
              asChild
              variant="ghost"
              className={`w-full justify-start gap-2 ${pathname.startsWith("/dashboard") ? "text-orange-500 bg-orange-500/10" : "text-gray-300 hover:text-orange-500 hover:bg-orange-500/10"}`}
            >
              <Link href="/dashboard" className="flex items-center gap-2 w-full">
                <TrendingUp className="h-4 w-4" />
                Portfolio
              </Link> 
            </Button>
            <Button
              asChild
              variant="ghost"
              className={`w-full justify-start gap-2 ${pathname.startsWith("/marketplace") ? "text-orange-500 bg-orange-500/10" : "text-gray-300 hover:text-orange-500 hover:bg-orange-500/10"}`}
            >
              <Link href="/marketplace" className="flex items-center gap-2 w-full">
                <TrendingUp className="h-4 w-4" />
                Marketplace
              </Link>
            </Button>
          </nav>
        </aside>
        <main className="p-6">
          <Marketplace />
        </main>
      </div>
    </div>
  );
}
