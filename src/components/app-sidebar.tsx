import { CheckSquare, MessageSquare, FileText, CalendarIcon, Mail } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger
} from "~/components/ui/sidebar"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"

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

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader>
          <TooltipProvider delayDuration={100} skipDelayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger className="[&_svg]:size-6"/>
              </TooltipTrigger>
              <TooltipContent>
                <p>Close sidebar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="ml-2">
                  <SidebarMenuButton className="gap-2.5" asChild>
                    <a href={item.url} >
                      <item.icon className="!h-5 !w-5 mr-1"/>
                      <span className="text-base">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
