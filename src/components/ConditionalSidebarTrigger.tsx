'use client'

import { SidebarTrigger, useSidebar } from "~/components/ui/sidebar";

export default function ConditionalSidebarTrigger() {
    const { open } = useSidebar(); // Assuming useSidebar provides `isOpen`
    
    if (open) return null; // Hide trigger when sidebar is open
  
    return <SidebarTrigger />;
  }
  