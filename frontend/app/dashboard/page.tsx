import { redirect } from "next/navigation";

import Dashboard from "@/components/Dashboard";
import { auth0 } from "@/lib/auth0";

export default async function DashboardPage() {
  const session = await auth0.getSession();
  if (!session) redirect("/auth/login?returnTo=/dashboard");

  return <Dashboard email={String(session.user.email || "")} name={String(session.user.name || "")} />;
}

