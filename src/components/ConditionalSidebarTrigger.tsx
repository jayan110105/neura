'use client'

import { SidebarTrigger, useSidebar } from "~/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"


export default function ConditionalSidebarTrigger() {
    const { open, isMobile } = useSidebar(); // Assuming useSidebar provides `isOpen`
    
    if (!isMobile && open) return null; // Hide trigger when sidebar is open
    
    
    return (
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
    );
  }
  