"use client";

import * as React from "react";
import {
  CheckCircle2,
  Crown,
  Database,
  HardDrive,
  Lock,
  Loader2,
  Snowflake,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createChariowCheckout } from "@/app/actions";

export type UpgradeLimitType =
  | "FREEZE_SLOT"
  | "SIZE_EXCEEDED"
  | "MEDIA_STORAGE"
  | "RETENTION"
  | "GENERAL";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limitType?: UpgradeLimitType;
  customDetail?: string;
  onSuccess?: () => void;
}

const LIMIT_INFO: Record<
  UpgradeLimitType,
  { emoji: string; title: string; freeLimit: string; proUnlock: string; icon: any }
> = {
  FREEZE_SLOT: {
    emoji: "🧊",
    title: "1 seul projet au congélateur",
    freeLimit: "Le plan FREE limite à 1 snapshot archivé à la fois.",
    proUnlock: "Freeze Slots illimités — archivez autant de projets que vous voulez.",
    icon: Snowflake,
  },
  SIZE_EXCEEDED: {
    emoji: "💾",
    title: "Limite de 500 Mo atteinte",
    freeLimit: "Les dumps sont plafonnés à 500 Mo compressés sur le plan FREE.",
    proUnlock: "Snapshots jusqu'à 10 Go — zéro restriction de taille.",
    icon: HardDrive,
  },
  MEDIA_STORAGE: {
    emoji: "🗂️",
    title: "Buckets Storage non inclus",
    freeLimit: "Seuls les schémas et données SQL sont sauvegardés en FREE.",
    proUnlock: "Sauvegarde complète : SQL + tous vos fichiers Storage Supabase.",
    icon: Database,
  },
  RETENTION: {
    emoji: "⏳",
    title: "Rétention limitée à 60 jours",
    freeLimit: "Vos archives sont supprimées après 60 jours sur le plan FREE.",
    proUnlock: "Rétention illimitée — vos snapshots ne disparaissent jamais.",
    icon: Lock,
  },
  GENERAL: {
    emoji: "✨",
    title: "Débloquez SupaHub PRO",
    freeLimit: "Le plan FREE inclut 1 projet actif et 1 slot au congélateur.",
    proUnlock: "Gestion illimitée de tous vos projets Supabase.",
    icon: Crown,
  },
};

const PRO_FEATURES = [
  "Freeze Slots illimités",
  "Snapshots jusqu'à 10 Go",
  "Buckets Storage sauvegardés",
  "Rétention Cold Storage illimitée",
];

export function UpgradeModal({
  open,
  onOpenChange,
  limitType = "GENERAL",
  customDetail,
  onSuccess,
}: UpgradeModalProps) {
  const [isUpgrading, setIsUpgrading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const info = LIMIT_INFO[limitType] || LIMIT_INFO.GENERAL;
  const LimitIcon = info.icon;

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    setError(null);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : undefined;
      const res = await createChariowCheckout(origin);

      if (res?.error) {
        setError(res.error);
        return;
      }

      if (res?.alreadyPro) {
        // Déjà acheté → succès immédiat, on recharge la page
        setSuccess(true);
        setTimeout(() => window.location.reload(), 1500);
        return;
      }

      if (res?.checkoutUrl) {
        // Redirection vers la page de paiement Chariow
        window.location.href = res.checkoutUrl;
        return;
      }

      setError("Réponse inattendue du service de paiement.");
    } catch (err: any) {
      setError(err.message || "Impossible d'initialiser le paiement.");
    } finally {
      setIsUpgrading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150"
      onClick={(e) => e.target === e.currentTarget && onOpenChange(false)}
    >
      <div className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden font-figtree animate-in zoom-in-95 duration-200">
        {/* Glow décoratif */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />

        {/* Bouton fermer */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-10 w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors"
        >
          <X className="w-3.5 h-3.5 text-neutral-500" />
        </button>

        <div className="p-6 space-y-5">
          {success ? (
            /* État succès */
            <div className="py-6 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <div>
                <p className="font-bold text-neutral-900 dark:text-white">Bienvenue dans PRO ✨</p>
                <p className="text-xs text-neutral-500 mt-1">Toutes les fonctionnalités sont débloquées.</p>
              </div>
            </div>
          ) : (
            <>
              {/* En-tête */}
              <div className="flex items-start gap-3 pr-6">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                  <LimitIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-0.5">
                    Plan FREE · Limite atteinte
                  </p>
                  <h2 className="text-base font-extrabold text-neutral-900 dark:text-white leading-tight">
                    {info.emoji} {info.title}
                  </h2>
                </div>
              </div>

              {/* Détail limite */}
              <div className="p-3 rounded-2xl bg-amber-500/8 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <Zap className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                <span>{customDetail || info.freeLimit}</span>
              </div>

              {/* Ce que PRO débloque */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  PRO débloque
                </p>
                <div className="p-3 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
                  <span className="font-medium">{info.proUnlock}</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  {PRO_FEATURES.map((f) => (
                    <div
                      key={f}
                      className="flex items-center gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-400"
                    >
                      <CheckCircle2 className="w-3 h-3 text-sky-500 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Erreur */}
              {error && (
                <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 rounded-xl text-xs h-10 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
                >
                  Rester en FREE
                </Button>
                <Button
                  size="sm"
                  disabled={isUpgrading}
                  onClick={handleUpgrade}
                  className="flex-1 h-10 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white shadow-md shadow-emerald-500/25 gap-1.5"
                >
                  {isUpgrading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  )}
                  <span>{isUpgrading ? "Activation..." : "PRO — 9,99 $/mois"}</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
