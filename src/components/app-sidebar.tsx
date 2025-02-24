'use client'

import { CheckSquare, MessageSquare, FileText, CalendarIcon, Mail, RefreshCw } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "~/components/ui/sidebar"

import { Button } from "~/components/ui/button"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"

import { usePathname } from "next/navigation";
import { NavMobile } from "./nav-mobile"

// Menu items.
const items = [
  {
    title: "Chat",
    url: "/chat",
    icon: MessageSquare,
  },
  {
    title: "Notes",
    url: "/notes",
    icon: FileText,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: CalendarIcon,
  },
  {
    title: "Email",
    url: "/email",
    icon: Mail,
  },
]

export function AppSidebar({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {

  const pathname = usePathname();

  const showChatComponent = pathname === "/chat";

  const handleResetChat = () => {
    // Trigger a custom event
    window.dispatchEvent(new Event("reset-chat"));
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader>
          <div className="flex justify-between">
            <TooltipProvider delayDuration={100} skipDelayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarTrigger className="my-1 ml-3 [&_svg]:size-6"/>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Close sidebar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {showChatComponent && (
              <TooltipProvider delayDuration={100} skipDelayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="my-1 mr-3 ml-1 px-0" onClick={handleResetChat}>
                      <RefreshCw className="!h-6 !w-6"/>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clear chat</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="mx-2">
                  <SidebarMenuButton className="gap-2.5 py-5" asChild>
                    <a href={item.url} >
                      <item.icon className="!h-5 !w-5 mr-1 text-black"/>
                      <span className="text-base text-black">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex sm:hidden">
        <NavMobile user={user}/>
      </SidebarFooter>
    </Sidebar>
  )
}
