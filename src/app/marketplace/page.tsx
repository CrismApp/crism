"use client";
import { Marketplace } from "@/components/marketplace";
import { HamburgerMenu } from "@/components/ui/hamburger-menu";
import { Sidebar } from "@/components/sidebar";

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="lg:grid lg:grid-cols-[280px_1fr]">
        {/* Hamburger Menu with Sidebar - handles both desktop and mobile */}
        <HamburgerMenu>
          <Sidebar />
        </HamburgerMenu>

        <main className="p-6 pt-20 lg:pt-6">{/* Add top padding on mobile for fixed header */}
          <Marketplace />
        </main>
      </div>
    </div>
  );
}
