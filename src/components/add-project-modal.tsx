"use client";

import * as React from "react";
import { Plus, Database, KeyRound, Loader2, X, Sparkles } from "lucide-react";
import { trackProject } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddProjectModal() {
  const [open, setOpen] = React.useState(false);
  const [projectName, setProjectName] = React.useState("");
  const [projectUrlOrRef, setProjectUrlOrRef] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // Extraction du ref si l'utilisateur colle l'URL complète
    let ref = projectUrlOrRef.trim();
    if (ref.includes("supabase.co")) {
      const match = ref.match(/https?:\/\/([^.]+)\.supabase\.co/);
      if (match && match[1]) {
        ref = match[1];
      }
    }

    const res = await trackProject({
      projectName: projectName.trim(),
      supabaseProjectRef: ref,
    });

    setLoading(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setOpen(false);
      setProjectName("");
      setProjectUrlOrRef("");
    }
  };

  return (
    <>
      <Button
        variant="default"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5 text-xs"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Ajouter un projet</span>
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200 font-figtree">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl p-6 sm:p-7 space-y-5">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                <Database className="h-3.5 w-3.5" />
                <span>Ajout rapide</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Activer le maintien actif (72h)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Renseignez simplement le nom et l&apos;URL de votre projet Supabase. Aucun mot de passe requis !
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="addProjectName" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Nom du projet
                </Label>
                <Input
                  id="addProjectName"
                  type="text"
                  placeholder="Ex: Mon SaaS Prod"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addProjectUrl" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  URL ou Référence du projet Supabase
                </Label>
                <Input
                  id="addProjectUrl"
                  type="text"
                  placeholder="https://xyzabcdef.supabase.co ou xyzabcdef"
                  value={projectUrlOrRef}
                  onChange={(e) => setProjectUrlOrRef(e.target.value)}
                  required
                  className="h-9 text-xs font-mono"
                />
                <p className="text-[11px] text-gray-400">
                  Visible dans l&apos;URL de votre dashboard Supabase.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Activation...
                    </span>
                  ) : (
                    "Activer la relance 72h"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
