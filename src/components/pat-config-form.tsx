"use client";

import { useState } from "react";
import { saveSupabasePat } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { KeyRound, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function PatConfigForm({ hasPat }: { hasPat: boolean }) {
  const [pat, setPat] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await saveSupabasePat({ pat });
    setLoading(false);

    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({
        type: "success",
        text: "Jeton d'accès personnel enregistré et chiffré en AES-256-GCM avec succès.",
      });
      setPat("");
    }
  }

  return (
    <Card variant="card" className="p-4 sm:p-6">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-emerald-500" />
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
              Jeton d&apos;accès personnel Supabase (PAT)
            </h3>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Permet de synchroniser instantanément l'intégralité de vos projets et organisations.
          </p>

          {/* Guide détaillé */}
          <div className="mt-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-400 space-y-1.5">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
              Comment générer votre clé sur Supabase :
            </span>
            <ol className="list-decimal list-inside space-y-1 pl-1 leading-relaxed">
              <li>Rendez-vous dans Supabase : <em>Account &gt; Access Tokens</em>.</li>
              <li>Cliquez sur <strong>Generate new token</strong>.</li>
              <li>Donnez un nom au token et choisissez sa période de validité.</li>
              <li>Dans <strong>Resource access</strong>, sélectionnez <em>Organizations</em> et cochez toutes les organisations souhaitées.</li>
              <li>Dans <strong>Permissions</strong>, choisissez <em>Full access (Read + Write)</em>.</li>
              <li>Copiez la clé (<code className="font-mono text-emerald-600 dark:text-emerald-400">sbp_...</code>) et collez-la ci-dessous.</li>
            </ol>
          </div>
        </div>

        {hasPat && (
          <div className="flex items-center gap-2 rounded-[8px] bg-[#f9f9fa] border border-[#eaebee] p-3 text-[12px] sm:text-[13px] text-[#333333]">
            <CheckCircle2 className="h-4 w-4 text-[#000000] shrink-0" />
            <span>Un jeton d&apos;accès est actuellement configuré et sécurisé.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="password"
            placeholder="sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            value={pat}
            onChange={(e) => setPat(e.target.value)}
            required
            className="flex-1"
          />
          <Button variant="primary" size="default" type="submit" disabled={loading || !pat}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer le jeton"}
          </Button>
        </form>

        {message && (
          <div
            className={`flex items-center gap-2 text-[13px] ${
              message.type === "success" ? "text-[#000000]" : "text-[#e03b24]"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span>{message.text}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
