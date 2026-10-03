import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthComponent } from "@/components/ui/sign-up";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <AuthComponent brandName="SupaHub" />;
}
