"use client";

import React, { useState, useEffect } from "react";
import {
  Archive,
  ChevronsRight,
  Database,
  ExternalLink,
  Layers,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OnboardingModal } from "@/components/onboarding-modal";
import { UpgradeModal } from "@/components/upgrade-modal";
import { Badge } from "@/components/ui/badge";

export interface DashboardLayoutProps {
  user?: {
    id?: string;
    email?: string;
    user_metadata?: {
      avatar_url?: string;
      full_name?: string;
      name?: string;
      user_name?: string;
      username?: string;
      contact_email?: string;
      onboarding_completed?: boolean;
    };
  };
  hasPat?: boolean;
  children: React.ReactNode;
  orgName?: string;
  protectedCount?: number;
  frozenCount?: number;
  plan?: "FREE" | "PRO";
}

export function DashboardLayout({
  user,
  hasPat = false,
  children,
  orgName,
  protectedCount = 0,
  frozenCount = 0,
  plan = "FREE",
}: DashboardLayoutProps) {
  const [isDark, setIsDark] = useState(false);
  const [open, setOpen] = useState(true);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const pathname = usePathname();

  const email = user?.email || "";
  let displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.username ||
    user?.user_metadata?.name ||
    orgName ||
    "";

  if (!displayName || displayName.startsWith("supabase-")) {
    displayName = orgName || (email && !email.startsWith("supabase-") ? email.split("@")[0] : "Membre Supabase");
  }

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const navItems = [
    {
      title: "Vue d'ensemble",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      title: "Projets",
      href: "/dashboard/projets",
      icon: Layers,
      active: pathname === "/dashboard/projets",
      badge: protectedCount > 0 ? `${protectedCount}` : undefined,
    },
    {
      title: "Sauvegardes R2",
      href: "/dashboard/sauvegardes",
      icon: Archive,
      active: pathname === "/dashboard/sauvegardes",
      badge: frozenCount > 0 ? `${frozenCount}` : undefined,
    },
    {
      title: "Paramètres & PAT",
      href: "/dashboard/parametres",
      icon: Settings,
      active: pathname === "/dashboard/parametres",
    },
  ];

  return (
    <div className={`flex min-h-screen w-full font-figtree ${isDark ? "dark" : ""}`}>
      {/* Modale d'Onboarding si non configuré */}
      <OnboardingModal initialUser={user} />

      <div className="flex w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        {/* Sidebar Bureau (Desktop) */}
        <nav
          className={`hidden md:flex sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out ${
            open ? "w-64" : "w-16"
          } border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2.5 shadow-xs flex-col justify-between z-30`}
        >
          <div>
            {/* Logo */}
            <div className="mb-4 border-b border-gray-200 dark:border-gray-800 pb-3">
              <Link
                href="/dashboard"
                className="flex cursor-pointer items-center justify-between rounded-xl p-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-2.5">
                  <div className="grid size-8 shrink-0 place-content-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xs text-white">
                    <Database className="h-4 w-4" />
                  </div>
                  {open && (
                    <div className="flex flex-col">
                      <span className="block text-sm font-bold leading-tight text-gray-900 dark:text-gray-100">
                        SupaHub
                      </span>
                      <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate max-w-[130px]">
                        {orgName || "Database Hub"}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </div>

            {/* Menu principal */}
            <div className="space-y-1 mb-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex h-10 w-full items-center rounded-xl transition-all duration-150 ${
                    item.active
                      ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold border-l-2 border-emerald-500 shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <div className="grid h-full w-12 place-content-center">
                    <item.icon className="h-4 w-4" />
                  </div>
                  {open && (
                    <span className="text-xs font-medium transition-opacity duration-200 truncate">
                      {item.title}
                    </span>
                  )}
                  {item.badge && open && (
                    <span className="absolute right-3 flex h-5 px-1.5 items-center justify-center rounded-full bg-emerald-500 dark:bg-emerald-600 text-[10px] text-white font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Promo Card PRO dans la Sidebar si FREE */}
            {open && plan === "FREE" && (
              <div className="mx-1 mb-4 p-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-sky-500/10 border border-emerald-500/20 dark:border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    Plan FREE
                  </span>
                  <span className="text-[9px] font-semibold text-neutral-400">1 slot R2</span>
                </div>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">
                  Passez au plan PRO pour geler des projets illimités et sauvegarder vos buckets.
                </p>
              <button
                  onClick={() => setUpgradeModalOpen(true)}
                  className="w-full h-7 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white font-bold text-[11px] shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Passer à PRO</span>
                </button>
              </div>
            )}
          </div>

          {/* Pied de Sidebar : Déconnexion & Réduction */}
          <div className="relative border-t border-gray-200 dark:border-gray-800 pt-3 space-y-1">
            {/* Bouton Déconnexion dans la Sidebar */}
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className={`w-full flex items-center h-10 rounded-xl transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 ${
                  open ? "px-3 gap-2.5" : "justify-center"
                }`}
                title="Déconnexion"
              >
                <div className="grid h-full w-8 place-content-center">
                  <LogOut className="h-4 w-4" />
                </div>
                {open && (
                  <span className="text-xs font-medium">Déconnexion</span>
                )}
              </button>
            </form>

            {/* Bouton Réduire la barre */}
            <button
              onClick={() => setOpen(!open)}
              className="w-full transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl p-2 flex items-center"
            >
              <div className="grid size-8 place-content-center">
                <ChevronsRight
                  className={`h-4 w-4 transition-transform duration-300 text-gray-500 dark:text-gray-400 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </div>
              {open && (
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Réduire la barre
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* Zone de contenu principale */}
        <div className="flex-1 flex flex-col min-w-0 overflow-auto pb-20 md:pb-0">
          {/* Header */}
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur px-5 sm:px-8">
            <div className="flex items-center gap-2">
              <div className="md:hidden grid size-7 shrink-0 place-content-center rounded-lg bg-emerald-500 text-white">
                <Database className="h-3.5 w-3.5" />
              </div>
              <h1 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                Bonjour, {displayName}
              </h1>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Badge Plan */}
              {plan === "PRO" ? (
                <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold gap-1 px-2.5 py-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>PRO ✨</span>
                </Badge>
              ) : (
              <button
                  onClick={() => setUpgradeModalOpen(true)}
                  className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition-all shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Plan FREE</span>
                  <span className="hidden sm:inline text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                    → Passer à PRO
                  </span>
                </button>
              )}

              <Link href="https://supabase.com/dashboard" target="_blank" className="hidden sm:inline-flex">
                <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                  <span>Supabase Console</span>
                  <ExternalLink className="h-3 w-3 text-gray-400" />
                </button>
              </Link>

              <button
                onClick={() => setIsDark(!isDark)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                title="Changer de thème"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </header>

          {/* Upgrade Modal Global */}
          <UpgradeModal
            open={upgradeModalOpen}
            onOpenChange={setUpgradeModalOpen}
            limitType="GENERAL"
          />

          {/* Corps de la page */}
          <main className="flex-1 p-5 sm:p-8 max-w-7xl w-full">
            {children}
          </main>
        </div>

        {/* Tab Bar Mobile (Navigation en bas d'écran sur mobile) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors relative ${
                item.active
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.title.split(" ")[0]}</span>
            </Link>
          ))}

          {/* Déconnexion Mobile */}
          <form action="/auth/signout" method="post" className="flex items-center justify-center">
            <button
              type="submit"
              className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-red-500 hover:text-red-700 transition-colors"
              title="Déconnexion"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Quitter</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
