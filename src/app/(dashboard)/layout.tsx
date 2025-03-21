import { SidebarProvider} from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";
import ConditionalSidebarTrigger from "~/components/ConditionalSidebarTrigger";
import { NavUser } from "~/components/nav-user";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
  params: { slug?: string[] };
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  let userData = null;

  if (session?.user?.id) {
    // Fetch user from DB using authenticated user's ID
    const user = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
    userData = user[0] ?? null;
  }

  return (
    <SidebarProvider>
      <AppSidebar user={{
          name: userData?.name ?? "Guest",
          email: userData?.email ?? "guest@example.com",
          avatar: userData?.image ?? "/default-avatar.png",
        }} />
      <div className="flex flex-col flex-1">
        <div className="flex justify-between sticky top-0 z-10">
          <div>{ConditionalSidebarTrigger ? <ConditionalSidebarTrigger /> : null}</div>
          <div className="hidden sm:flex">
            <NavUser user={{
                name: userData?.name ?? "Guest",
                email: userData?.email ?? "guest@example.com",
                avatar: userData?.image ?? "/default-avatar.png",
              }} />
          </div>
        </div>
        <div className="flex-1 items-end">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}

