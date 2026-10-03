"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Snowflake, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/badge";

export function HeroSectionPixso() {
  return (
    <section className="relative flex flex-col items-center justify-start w-full min-h-screen overflow-hidden">
      {/* Vidéo d'arrière-plan couvrant tout le header et hero */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-80 pointer-events-none"
      >
        <source
          src="/videos/Glowing_spores_drifting_in_forest_20260930174232.mp4"
          type="video/mp4"
        />
      </video>

      {/* Léger voile translucide pour garantir le contraste sans aucune bannière ni cadre */}
      <div className="absolute inset-0 bg-[#faf8fd]/20 z-0 pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#faf8fd] to-transparent z-0 pointer-events-none" />

      {/* Halo de lumière Pixso */}
      <div className="absolute size-[22rem] sm:size-[32rem] rounded-full bg-[#cfe7ed]/35 blur-[6rem] sm:blur-[8rem] top-1/4 left-1/2 -translate-x-1/2 z-0 pointer-events-none" />

      {/* 1. Header intégré directement sur la vidéo (sans conteneur ni fond) */}
      <header className="relative z-20 w-full max-w-[1200px] px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-[8px] bg-gradient-to-tr from-[#ee7cff] via-[#4e6fff] to-[#559cff]" />
          <span className="font-bold text-[18px] sm:text-[20px] tracking-tight text-[#000000]">SupaHub</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-[#121212]">
          <a href="#maintien" className="hover:text-[#000000] hover:underline transition">Maintien actif</a>
          <a href="#stockage" className="hover:text-[#000000] hover:underline transition">Stockage à froid</a>
          <a href="#comment-ca-marche" className="hover:text-[#000000] hover:underline transition">Comment ça marche</a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login">
            <Button variant="ghost" size="nav" className="hover:bg-white/40 text-[13px] sm:text-[14px] px-3 sm:px-4">
              Connexion
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="primary" size="nav" className="text-[13px] sm:text-[14px] px-3 sm:px-4">
              Commencer
            </Button>
          </Link>
        </div>
      </header>

      {/* Contenu textuel et CTAs */}
      <div className="flex flex-col items-center justify-center text-center gap-y-5 sm:gap-y-6 max-w-4xl px-4 sm:px-6 pt-8 sm:pt-14 pb-10 sm:pb-16 relative z-20">
        {/* Titre Principal */}
        <h1 className="text-[32px] sm:text-[48px] lg:text-[60px] font-bold tracking-tight leading-[1.12] text-[#000000] max-w-3xl">
          Gérez vos bases Supabase sans contrainte de quota.
        </h1>

        {/* Sous-titre */}
        <p className="max-w-2xl mx-auto text-[15px] sm:text-[17px] md:text-[18px] text-[#333333] leading-relaxed font-medium">
          Empêchez la mise en veille automatique après 7 jours et archivez vos bases inactives vers Cloudflare R2 pour libérer vos emplacements gratuits en 1 clic.
        </p>

        {/* Ligne d'action (Primary Carbon + Secondary Outlined Glass 3D) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 w-full sm:w-auto">
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto px-7 group">
              Lancer SupaHub gratuitement
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
          <a href="/#comment-ca-marche" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="glass3d w-full sm:w-auto px-7 text-[#000000] border border-[#eaebee] font-medium hover:bg-white/80 transition-all">
              <span className="relative z-20 text-[#000000] font-medium">Découvrir le fonctionnement</span>
            </Button>
          </a>
        </div>
      </div>

      {/* 1. Showcase Frame (Console SupaHub avec Effet Glass 3D et extension infinie vers le bas) */}
      <div className="mt-4 sm:mt-8 max-w-5xl w-full px-3 sm:px-6 relative z-20 pb-0">
        <div className="glass3d rounded-t-[16px] sm:rounded-t-[20px] rounded-b-none border-t border-x border-[#eaebee]/90 p-4 sm:p-6 pb-20 sm:pb-28 text-left [mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)]">
          {/* En-tête de la console */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#eaebee]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#eaebee]" />
              <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#eaebee]" />
              <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#eaebee]" />
              <span className="ml-1 sm:ml-2 text-[11px] sm:text-[12px] font-mono text-[#808080]">app.supahub.dev</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <Tag variant="success">2 / 2 Emplacements actifs</Tag>
              <Tag variant="ice">3 Instantanés sur R2</Tag>
            </div>
          </div>

          {/* Grille des bases de données */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 mt-5">
            {/* Projet 1 */}
            <div className="rounded-[8px] border border-[#eaebee] bg-[#ffffff] p-3.5 sm:p-4 space-y-3 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-[13px] sm:text-[14px] text-[#000000]">saas-analytics-prod</h4>
                  <p className="text-[11px] font-mono text-[#808080]">ref: abxq-9021</p>
                </div>
                <Tag variant="success">Actif</Tag>
              </div>
              <div className="rounded-[6px] bg-[#f9f9fa] p-2.5 text-[11px] sm:text-[12px] text-[#666666] space-y-1 border border-[#eaebee]/60">
                <div className="flex justify-between">
                  <span>Maintien actif :</span>
                  <span className="text-[#000000] font-medium">Toutes les 72h</span>
                </div>
                <div className="flex justify-between">
                  <span>Dernier signal :</span>
                  <span className="text-[#000000]">Il y a 3h (200 OK)</span>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="w-full text-[12px]">
                <Snowflake className="h-3.5 w-3.5 mr-1" /> Geler vers R2
              </Button>
            </div>

            {/* Projet 2 */}
            <div className="rounded-[8px] border border-[#eaebee] bg-[#ffffff] p-3.5 sm:p-4 space-y-3 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-[13px] sm:text-[14px] text-[#000000]">backend-api-v2</h4>
                  <p className="text-[11px] font-mono text-[#808080]">ref: kyrt-4412</p>
                </div>
                <Tag variant="success">Actif</Tag>
              </div>
              <div className="rounded-[6px] bg-[#f9f9fa] p-2.5 text-[11px] sm:text-[12px] text-[#666666] space-y-1 border border-[#eaebee]/60">
                <div className="flex justify-between">
                  <span>Maintien actif :</span>
                  <span className="text-[#000000] font-medium">Toutes les 72h</span>
                </div>
                <div className="flex justify-between">
                  <span>Dernier signal :</span>
                  <span className="text-[#000000]">Il y a 8h (200 OK)</span>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="w-full text-[12px]">
                <Snowflake className="h-3.5 w-3.5 mr-1" /> Geler vers R2
              </Button>
            </div>

            {/* Projet 3 (Stocké sur R2) */}
            <div className="rounded-[8px] border border-[#cfe7ed] bg-[#cfe7ed]/20 p-3.5 sm:p-4 space-y-3 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-[13px] sm:text-[14px] text-[#000000]">demo-boutique-v1</h4>
                  <p className="text-[11px] font-mono text-[#666666]">r2: snapshot_0930.sql.gz</p>
                </div>
                <Tag variant="ice">Stocké R2</Tag>
              </div>
              <div className="rounded-[6px] bg-[#ffffff] p-2.5 text-[11px] sm:text-[12px] text-[#666666] space-y-1 border border-[#eaebee]">
                <div className="flex justify-between">
                  <span>Taille archive :</span>
                  <span className="text-[#000000] font-medium">4.2 Mo (.sql.gz)</span>
                </div>
                <div className="flex justify-between">
                  <span>Emplacement :</span>
                  <span className="text-[#000000] font-medium">Libéré (0 €)</span>
                </div>
              </div>
              <Button variant="primary" size="sm" className="w-full text-[12px]">
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restaurer en 1 clic
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
