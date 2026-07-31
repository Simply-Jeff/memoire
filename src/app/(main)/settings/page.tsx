import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ApiTokenManager } from "@/components/settings/ApiTokenManager";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and integrations.
        </p>
      </div>

      <ApiTokenManager />
    </div>
  );
}
