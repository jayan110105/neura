'use client'

import { SidebarTrigger, useSidebar } from "~/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";

export default function ConditionalSidebarTrigger() {

    const { open, isMobile } = useSidebar(); // Assuming useSidebar provides `isOpen`
    const pathname = usePathname();
    
    const showSidebarTrigger = isMobile || !open;
    const showChatComponent = showSidebarTrigger && pathname === "/chat";

    const handleResetChat = () => {
      // Trigger a custom event
      window.dispatchEvent(new Event("reset-chat"));
    };

    return (
      <>
        {/* Render SidebarTrigger when mobile & sidebar is closed */}
        {showSidebarTrigger && (
          <TooltipProvider delayDuration={100} skipDelayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger className="my-2 mx-4 [&_svg]:size-6"/>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open sidebar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Render ChatSpecificComponent only in /dashboard/chat */}
        {showChatComponent && (
          <TooltipProvider delayDuration={100} skipDelayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="my-2 mx-1 px-0" 
                  onClick={handleResetChat}
                >
                  <RefreshCw className="!h-6 !w-6"/>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </>
    );
  }
  