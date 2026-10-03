"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Tag } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { BentoGridShowcase } from "@/components/ui/bento-product-features";
import {
  Activity,
  Command,
  ShieldCheck,
  Sliders,
} from "lucide-react";

// 1. Emplacement Grand Panneau Gauche : Automatisation Maintien Actif
const IntegrationCard = () => {
  const [enabled, setEnabled] = React.useState(true);

  return (
    <Card variant="card" className="flex h-full flex-col justify-between p-6">
      <div>
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[8px] bg-[#cfe7ed] text-[#000000] border border-[#cfe7ed]">
          <Activity className="h-5 w-5 text-[#000000]" />
        </div>
        <CardTitle className="text-[18px]">Maintien actif automatisé</CardTitle>
        <CardDescription className="text-[13px] text-[#666666] mt-2 leading-relaxed">
          Activez l&apos;orchestration continue pour vos instances Supabase. SupaHub envoie une vérification de santé périodique toutes les 72 heures sans impacter vos quotas ni vos ressources.
        </CardDescription>

        <div className="mt-5 space-y-2 rounded-[8px] bg-[#f9f9fa] p-3 text-[12px] border border-[#eaebee]">
          <div className="flex justify-between">
            <span className="text-[#666666]">Fréquence :</span>
            <span className="text-[#000000] font-medium">Toutes les 72h</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666666]">Impact calcul :</span>
            <span className="text-[#000000] font-medium">&lt; 15 ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666666]">Statut Cron :</span>
            <span className="text-[#000000] font-medium">En ligne</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[#eaebee] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-[#666666]" />
          <span className="text-[13px] font-medium text-[#000000]">Protection active</span>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          aria-label="Basculer le maintien actif"
        />
      </div>
    </Card>
  );
};

// 2. Emplacement Haut-Milieu : Flotte de bases suivies
const TrackersCard = () => (
  <Card variant="card" className="h-full">
    <CardContent className="flex h-full flex-col justify-between p-5">
      <div>
        <CardTitle className="text-[15px] font-semibold text-[#000000]">
          Bases de données surveillées
        </CardTitle>
        <CardDescription className="text-[12px] text-[#666666]">
          Synchronisation en temps réel
        </CardDescription>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#000000]" />
          <span className="text-[13px] font-medium text-[#000000]">02 Projets actifs</span>
        </div>
        <Tag variant="ice">Protéger</Tag>
      </div>
    </CardContent>
  </Card>
);

// 3. Emplacement Haut-Droite : Multiplicateur / Résultat
const StatisticCard = () => (
  <Card variant="card" className="relative h-full w-full overflow-hidden">
    <div
      className="absolute inset-0 opacity-15"
      style={{
        backgroundImage: "radial-gradient(#000000 1px, transparent 1px)",
        backgroundSize: "14px 14px",
      }}
    />
    <CardContent className="relative z-10 flex h-full flex-col items-center justify-center p-5 text-center">
      <span className="text-[42px] font-bold text-[#000000] tracking-tight leading-none">
        0 min
      </span>
      <span className="text-[12px] text-[#666666] mt-1 font-medium">
        d&apos;interruption ou mise en pause
      </span>
    </CardContent>
  </Card>
);

// 4. Emplacement Milieu-Milieu : Taux de disponibilité 100%
const FocusCard = () => (
  <Card variant="card" className="h-full">
    <CardContent className="flex h-full flex-col justify-between p-5">
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-[15px] font-semibold text-[#000000]">
            Disponibilité continue
          </CardTitle>
          <CardDescription className="text-[12px] text-[#666666]">
            Cycle automatique 72h
          </CardDescription>
        </div>
        <Tag variant="ice">99.9%</Tag>
      </div>
      <div className="my-2">
        <span className="text-[32px] font-bold text-[#000000] tracking-tight">100%</span>
      </div>
      <div className="flex justify-between text-[11px] text-[#808080]">
        <span>Zéro mise en pause</span>
        <span>Suivi 24h/24</span>
      </div>
    </CardContent>
  </Card>
);

// 5. Emplacement Milieu-Droite : Sauvegarde sans surcharge
const ProductivityCard = () => (
  <Card variant="card" className="h-full">
    <CardContent className="flex h-full flex-col justify-end p-5">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#f9f9fa] border border-[#eaebee]">
        <ShieldCheck className="h-4 w-4 text-[#000000]" />
      </div>
      <CardTitle className="text-[15px] font-semibold text-[#000000]">
        Tranquillité d&apos;esprit totale
      </CardTitle>
      <CardDescription className="text-[12px] text-[#666666] mt-1 leading-normal">
        Vos APIs et bases de données restent opérationnelles sans intervention manuelle.
      </CardDescription>
    </CardContent>
  </Card>
);

// 6. Emplacement Bas Large : Actions rapides et contrôles
const ShortcutsCard = () => (
  <Card variant="card" className="h-full">
    <CardContent className="flex h-full flex-wrap items-center justify-between gap-4 p-5">
      <div>
        <CardTitle className="text-[15px] font-semibold text-[#000000]">
          Contrôles et déclenchements rapides
        </CardTitle>
        <CardDescription className="text-[12px] text-[#666666] mt-0.5">
          Déclenchez un signal de santé immédiat ou exportez vos tables en un raccourci.
        </CardDescription>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex h-7 px-2 items-center justify-center rounded-[6px] border border-[#eaebee] bg-[#f9f9fa] font-mono text-[11px] font-medium text-[#333333]">
          <Command className="h-3 w-3 mr-1" /> K
        </div>
        <span className="text-[12px] text-[#808080]">Console</span>
      </div>
    </CardContent>
  </Card>
);

export function MaintienBentoSection() {
  return (
    <section id="maintien" className="py-20 px-6 max-w-[1200px] mx-auto border-t border-[#eaebee]">
      <div className="space-y-4 max-w-2xl mb-12">
        <Tag variant="ice">Maintien actif intelligent</Tag>
        <h2 className="text-[34px] font-bold tracking-tight text-[#000000]">
          Gardez vos bases Supabase toujours éveillées
        </h2>
        <p className="text-[15px] text-[#666666]">
          Une architecture automatisée pour garantir la continuité de service de vos applications.
        </p>
      </div>

      <BentoGridShowcase
        integration={<IntegrationCard />}
        trackers={<TrackersCard />}
        statistic={<StatisticCard />}
        focus={<FocusCard />}
        productivity={<ProductivityCard />}
        shortcuts={<ShortcutsCard />}
      />
    </section>
  );
}
