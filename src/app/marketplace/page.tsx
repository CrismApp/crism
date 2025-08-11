"use client";
import { Marketplace } from "@/components/marketplace";
import { HamburgerMenu } from "@/components/ui/hamburger-menu";
import { Sidebar } from "@/components/sidebar";

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="grid lg:grid-cols-[280px_1fr]">
        {/* Hamburger Menu with Sidebar */}
        <HamburgerMenu>
          <Sidebar />
        </HamburgerMenu>

        <main className="p-6 lg:p-6 pt-20 lg:pt-6 pr-20 lg:pr-6">{/* Add top padding on mobile for hamburger button and right padding for hamburger */}
          <Marketplace />
        </main>
      </div>
    </div>
  );
}
