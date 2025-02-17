import { SidebarProvider} from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";
import ConditionalSidebarTrigger from "~/components/ConditionalSidebarTrigger";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col flex-1">
        <ConditionalSidebarTrigger />
        <div className="flex-1 items-end">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}

