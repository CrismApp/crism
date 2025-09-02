"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useWallet } from "@/context/WalletContext";
import Learn from "@/components/learn";
import { HamburgerMenu } from "@/components/ui/hamburger-menu";
import { Sidebar } from "@/components/sidebar";
import { Auth } from "@/components/auth";

export default function LearnPage() {
  const { data: session, isPending } = useSession();
  const { walletAddress, connectWallet, disconnectWallet } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/");
    }
  }, [session, isPending, router]);

  const handleWalletConnect = async (address: string) => {
    await connectWallet(address);
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const handleShowProfile = () => {
    router.push("/profile");
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return <Auth onAuthSuccess={() => router.push("/learn")} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="lg:grid lg:grid-cols-[280px_1fr]">
        {/* Hamburger Menu with Sidebar - handles both desktop and mobile */}
        <HamburgerMenu>
          <Sidebar
            walletAddress={walletAddress || undefined}
            user={session.user}
            onDisconnect={handleDisconnect}
            onShowProfile={handleShowProfile}
            onWalletConnect={handleWalletConnect}
          />
        </HamburgerMenu>

        <main className="p-6 pt-20 lg:pt-6">{/* Add top padding on mobile for fixed header */}
          <Learn />
        </main>
      </div>
    </div>
  );
}
