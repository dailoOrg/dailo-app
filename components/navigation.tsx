import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Podcast, BookOpen, Globe } from "lucide-react";

export function Navigation() {
  return (
    <nav className="border-b bg-black">
      <div className="flex h-16 items-center px-4 justify-between max-w-7xl mx-auto">
        <div className="flex items-center">
          <Link href="/" className="mr-8">
            <Image 
              src="/dailo.svg" 
              alt="Dailo Logo" 
              width={60} 
              height={19} 
              className="hover:opacity-90 transition-opacity"
            />
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/podcasts/ai-frontiers">
              <Button variant="ghost" className="flex items-center space-x-2 text-white/70 hover:text-white hover:bg-white/10">
                <Podcast className="h-4 w-4" />
                <span>AI Frontiers</span>
              </Button>
            </Link>
            <Link href="/podcasts/blockchain-decoded">
              <Button variant="ghost" className="flex items-center space-x-2 text-white/70 hover:text-white hover:bg-white/10">
                <BookOpen className="h-4 w-4" />
                <span>Blockchain</span>
              </Button>
            </Link>
            <Link href="/podcasts/icp-insights">
              <Button variant="ghost" className="flex items-center space-x-2 text-white/70 hover:text-white hover:bg-white/10">
                <Globe className="h-4 w-4" />
                <span>ICP Insights</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 