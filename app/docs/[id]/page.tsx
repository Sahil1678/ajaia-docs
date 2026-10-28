import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import DocEditor from "@/components/DocEditor";

export const dynamic = "force-dynamic";

export default async function DocPage({ params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s) redirect("/login");
  return <DocEditor id={params.id} userName={s.name} />;
}
