"use client";

import * as React from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  KeyRound,
  Layers,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
  Sliders,
  User,
  X,
  Zap,
} from "lucide-react";
import { saveOnboardingProfile } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OnboardingModalProps {
  initialUser?: {
    id?: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      name?: string;
      username?: string;
      contact_email?: string;
      onboarding_completed?: boolean;
    };
  };
}

export function OnboardingModal({ initialUser }: OnboardingModalProps) {
  const isAlreadyOnboarded = initialUser?.user_metadata?.onboarding_completed === true;
  const [isOpen, setIsOpen] = React.useState(!isAlreadyOnboarded);
  const [step, setStep] = React.useState<1 | 2>(1);
  const [syncMethod, setSyncMethod] = React.useState<"pat" | "manual">("pat");

  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = React.useState(
    initialUser?.user_metadata?.full_name ||
    initialUser?.user_metadata?.name ||
    (initialUser?.email && !initialUser.email.startsWith("supabase-") ? initialUser.email.split("@")[0] : "")
  );

  const [contactEmail, setContactEmail] = React.useState(
    initialUser?.user_metadata?.contact_email ||
    (initialUser?.email && !initialUser.email.startsWith("supabase-") ? initialUser.email : "")
  );

  const [pat, setPat] = React.useState("");

  if (!isOpen) return null;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg("Veuillez renseigner votre nom complet ou pseudonyme.");
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  const handleFinishOnboarding = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (syncMethod === "pat") {
      if (!pat.trim()) {
        setErrorMsg("Veuillez renseigner votre Personal Access Token (PAT) Supabase.");
        return;
      }
      if (!pat.trim().startsWith("sbp_")) {
        setErrorMsg("Le jeton d'accès Supabase doit commencer par 'sbp_'");
        return;
      }
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await saveOnboardingProfile({
      fullName: fullName.trim(),
      contactEmail: contactEmail.trim() || undefined,
      pat: syncMethod === "pat" ? pat.trim() : undefined,
    });

    setLoading(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in-0 duration-200 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl font-figtree p-5 sm:p-6 my-auto">
        {/* Bouton fermeture */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors z-10"
          title="Fermer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Zone de contenu avec défilement interne invisible mais 100% fonctionnel */}
        <div className="overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden space-y-4">
          {/* Header avec indicateur d'étapes */}
          <div className="space-y-1.5 pr-6">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <Sparkles className="h-3 w-3" />
                <span>Configuration SupaHub</span>
              </div>

              {/* Stepper */}
              <div className="flex items-center gap-1 text-xs font-medium text-neutral-400">
                <span className={`px-2 py-0.5 rounded-full text-[11px] ${step === 1 ? "bg-emerald-500 text-white font-bold" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"}`}>
                  1
                </span>
                <span>/</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] ${step === 2 ? "bg-emerald-500 text-white font-bold" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"}`}>
                  2
                </span>
              </div>
            </div>

            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {step === 1 ? "1. Vos informations de profil" : "2. Mode de synchronisation"}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {step === 1
                ? "Personnalisez votre compte pour vos alertes de maintien actif."
                : "Choisissez comment connecter et gérer vos projets Supabase."}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-medium leading-relaxed">
              {errorMsg}
            </div>
          )}

        {/* ÉTAPE 1 : PROFIL & NOTIFICATIONS */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="onboardName"
                  className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5"
                >
                  <User className="h-3.5 w-3.5 text-neutral-400" />
                  Nom complet / Pseudonyme <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="onboardName"
                  type="text"
                  placeholder="Ex: Alexandre Dupont"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-11 text-sm rounded-xl bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="onboardEmail"
                  className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5"
                >
                  <Mail className="h-3.5 w-3.5 text-neutral-400" />
                  Email de notification
                </Label>
                <Input
                  id="onboardEmail"
                  type="email"
                  placeholder="alex@entreprise.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="h-11 text-sm rounded-xl bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800"
                />
                <p className="text-[11px] text-neutral-400">
                  Adresse de réception des rapports de relance 72h et d&apos;archivage.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-11 rounded-xl gap-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
              >
                <span>Continuer vers la configuration</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        {/* ÉTAPE 2 : CHOIX DU MOYEN DE SYNCHRONISATION */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Sélecteur de méthode (Tabs) */}
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-neutral-100 dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setSyncMethod("pat");
                  setErrorMsg(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  syncMethod === "pat"
                    ? "bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Mode PAT (Auto)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSyncMethod("manual");
                  setErrorMsg(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  syncMethod === "manual"
                    ? "bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Mode Manuel</span>
              </button>
            </div>

            {/* CONTENU OPTION 1 : MOYEN PAT */}
            {syncMethod === "pat" && (
              <form onSubmit={handleFinishOnboarding} className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <Zap className="w-4 h-4 text-emerald-500" />
                    <span>Synchronisation globale en 1 clic</span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Le PAT (Personal Access Token) permet de découvrir automatiquement <strong>toutes vos organisations et projets</strong> sans aucune configuration manuelle par projet.
                  </p>

                  {/* Tips où trouver le PAT */}
                  <div className="pt-2.5 border-t border-emerald-500/10 space-y-2 text-[11px] text-neutral-600 dark:text-neutral-400">
                    <p className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Guide détaillé pour générer votre clé PAT :
                    </p>
                    <ol className="space-y-1.5 pl-1 list-decimal list-inside leading-relaxed text-neutral-600 dark:text-neutral-300">
                      <li>
                        Rendez-vous dans Supabase : <em>Account &gt; Access Tokens</em>.
                      </li>
                      <li>
                        Cliquez sur <strong>Generate new token</strong>.
                      </li>
                      <li>
                        Renseignez un nom (ex: <code className="font-mono text-emerald-600 dark:text-emerald-400">SupaHub Key</code>) et choisissez la période de validité souhaitée.
                      </li>
                      <li>
                        Dans <strong>Resource access</strong>, sélectionnez <em>Organizations</em> et <strong>cochez toutes les organisations</strong> que vous souhaitez gérer.
                      </li>
                      <li>
                        Dans <strong>Permissions</strong>, choisissez <em>Full access (Read + Write)</em>.
                      </li>
                      <li>
                        Validez et collez votre clé (<code className="font-mono text-emerald-600 dark:text-emerald-400">sbp_...</code>) ci-dessous.
                      </li>
                    </ol>
                    <div className="pt-1">
                      <a
                        href="https://supabase.com/dashboard/account/tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        <span>Ouvrir la page des Access Tokens Supabase</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="patInput" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Votre Personal Access Token (PAT) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="patInput"
                    type="password"
                    placeholder="sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={pat}
                    onChange={(e) => setPat(e.target.value)}
                    required
                    className="h-11 text-xs font-mono rounded-xl bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="h-11 rounded-xl text-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    <span>Retour</span>
                  </Button>

                  <Button
                    type="submit"
                    disabled={loading || !pat.trim()}
                    className="flex-1 h-11 rounded-xl gap-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  >
                    {loading ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Vérification du PAT...
                      </span>
                    ) : (
                      <>
                        <span>Valider et Accéder au Dashboard</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* CONTENU OPTION 2 : MOYEN MANUEL */}
            {syncMethod === "manual" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
                    <Sliders className="w-4 h-4 text-emerald-500" />
                    <span>Fonctionnement du Mode Manuel sur le Dashboard</span>
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Sans PAT, vous gérez vos projets à la carte directement depuis l'interface :
                  </p>

                  <div className="space-y-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                    <div className="flex items-start gap-2.5">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                        1
                      </span>
                      <p>
                        <strong>Visualisation :</strong> Vos projets de l'organisation OAuth connectée sont immédiatement visibles dans l'onglet <strong>Projets</strong>.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                        2
                      </span>
                      <p>
                        <strong>Keep-Alive 72h :</strong> Pour chaque base à protéger, basculez le toggle sur <strong>ON</strong> et renseignez sa <strong>Anon Key (Public Key)</strong>.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                        3
                      </span>
                      <p>
                        <strong>Multi-organisations :</strong> Vous pourrez relier vos autres organisations à tout moment via le bouton <strong>« Lier une organisation »</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="h-11 rounded-xl text-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    <span>Retour</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={() => handleFinishOnboarding()}
                    disabled={loading}
                    className="flex-1 h-11 rounded-xl gap-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  >
                    {loading ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Accès au dashboard...
                      </span>
                    ) : (
                      <>
                        <span>J'ai compris, Accéder au Dashboard</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
