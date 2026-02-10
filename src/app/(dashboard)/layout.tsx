import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Header, Sidebar } from "@/shared/components/layouts";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-20 lg:ml-64">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
