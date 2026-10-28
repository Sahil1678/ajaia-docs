import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Dashboard from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const s = await getSession();
  if (!s) redirect("/login");
  return <Dashboard user={{ name: s.name, email: s.email }} />;
}
