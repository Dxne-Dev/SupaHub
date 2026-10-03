"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail, Loader2, Code2 } from "lucide-react";
import Link from "next/link";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const supabase = createClient();

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({
        type: "success",
        text: "Un lien de connexion instantané a été envoyé à votre adresse e-mail.",
      });
    }
  }

  async function handleGithubLogin() {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  }

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 px-6 bg-[#faf8fd]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="h-6 w-6 rounded-[6px] bg-gradient-to-tr from-[#ee7cff] via-[#4e6fff] to-[#559cff]" />
          <span className="text-[22px] font-bold tracking-tight text-[#000000]">SupaHub</span>
        </Link>
        <h1 className="text-[30px] font-bold tracking-tight text-[#000000]">
          Connexion à votre espace
        </h1>
        <p className="mt-1.5 text-[14px] text-[#666666]">
          Gérez votre flotte et vos sauvegardes de bases de données Supabase.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card variant="card" className="p-7 space-y-4">
          <Button
            variant="secondary"
            onClick={handleGithubLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2"
          >
            <Code2 className="h-4 w-4" />
            Continuer avec GitHub
          </Button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[#eaebee]" />
            <span className="flex-shrink mx-4 text-[12px] uppercase text-[#808080] font-medium tracking-wider">
              ou par e-mail
            </span>
            <div className="flex-grow border-t border-[#eaebee]" />
          </div>

          <form onSubmit={handleMagicLink} className="space-y-3">
            <div>
              <Input
                type="email"
                placeholder="nom@entreprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button variant="primary" type="submit" disabled={loading || !email} className="w-full">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-1" />
                  Recevoir le lien magique
                </>
              )}
            </Button>
          </form>

          {message && (
            <div
              className={`p-3 rounded-[8px] text-[13px] border ${
                message.type === "success"
                  ? "bg-[#cfe7ed]/30 border-[#cfe7ed] text-[#000000]"
                  : "bg-[#ffffff] border-[#e03b24] text-[#e03b24]"
              }`}
            >
              {message.text}
            </div>
          )}
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-[13px] text-[#666666] hover:text-[#000000]">
            ← Revenir à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
