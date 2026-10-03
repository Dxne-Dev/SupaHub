"use client";

import * as React from "react";
import { Plus, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabaseOAuthUrl } from "@/app/actions";

interface ConnectOrgButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

export function ConnectOrgButton({
  className,
  variant = "outline",
  size = "sm",
  children,
}: ConnectOrgButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const origin = typeof window !== "undefined" ? window.location.origin : undefined;
      const res = await getSupabaseOAuthUrl(origin);
      if (res?.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      alert(err.message || "Impossible d'initialiser l'autorisation Supabase");
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleConnect}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        children || (
          <>
            <Plus className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
            <span>Lier une autre organisation</span>
          </>
        )
      )}
    </Button>
  );
}
