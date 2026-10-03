import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/badge";
import { MaintienBentoSection } from "@/components/maintien-bento-section";
import { HeroSectionPixso } from "@/components/hero-section-pixso";
import { HowItWorks } from "@/components/ui/how-it-works";
import { Footer } from "@/components/ui/large-name-footer";
import { ArrowRight, Check } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf8fd] text-[#000000] overflow-x-hidden">
      {/* 1. Header & Hero intégrés directement sur la vidéo */}
      <HeroSectionPixso />

      {/* 4. Section Fonctionnalités & Maintien Actif (Bento Grid Pixso) */}
      <MaintienBentoSection />

      {/* 5. Section Stockage à Froid & Restauration */}
      <section id="stockage" className="py-14 sm:py-20 px-4 sm:px-6 max-w-[1200px] mx-auto border-t border-[#eaebee]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 items-center">
          <div className="space-y-4 sm:space-y-5">
            <Tag variant="ice">Stockage à froid</Tag>
            <h2 className="text-[26px] sm:text-[34px] font-bold tracking-tight text-[#000000] leading-snug">
              Libérez vos emplacements gratuits en toute sérénité
            </h2>
            <p className="text-[14px] sm:text-[15px] text-[#666666] leading-relaxed">
              Lorsque vous atteignez la limite de 2 projets actifs sur votre compte Supabase gratuit, gelez les projets secondaires. SupaHub extrait la totalité du schéma, compresse le contenu jusqu&apos;à 80% et archive le fichier sur Cloudflare R2.
            </p>
            <ul className="space-y-2.5 text-[13px] sm:text-[14px] text-[#333333]">
              <li className="flex items-start sm:items-center gap-2">
                <Check className="h-4 w-4 text-[#000000] shrink-0 mt-0.5 sm:mt-0" /> 
                <span>Sauvegarde du schéma, des données et des règles RLS</span>
              </li>
              <li className="flex items-start sm:items-center gap-2">
                <Check className="h-4 w-4 text-[#000000] shrink-0 mt-0.5 sm:mt-0" /> 
                <span>Compression gzip ultra-rapide</span>
              </li>
              <li className="flex items-start sm:items-center gap-2">
                <Check className="h-4 w-4 text-[#000000] shrink-0 mt-0.5 sm:mt-0" /> 
                <span>Restauration automatisée sur une nouvelle instance</span>
              </li>
            </ul>
          </div>

          <Card variant="panel" className="p-5 sm:p-8 space-y-4">
            <h3 className="text-[16px] sm:text-[18px] font-semibold text-[#000000]">
              Le cycle de gel et de restauration
            </h3>
            <div className="space-y-2.5 sm:space-y-3 font-mono text-[12px] sm:text-[13px] text-[#333333]">
              <div className="rounded-[6px] bg-[#ffffff] p-3 border border-[#eaebee]">
                <span className="text-[#808080]">01.</span> Extraction complète via pg_dump
              </div>
              <div className="rounded-[6px] bg-[#ffffff] p-3 border border-[#eaebee]">
                <span className="text-[#808080]">02.</span> Compression gzip en archive .sql.gz
              </div>
              <div className="rounded-[6px] bg-[#ffffff] p-3 border border-[#eaebee]">
                <span className="text-[#808080]">03.</span> Transfert sécurisé vers Cloudflare R2
              </div>
              <div className="rounded-[6px] bg-[#ffffff] p-3 border border-[#eaebee]">
                <span className="text-[#808080]">04.</span> Suppression du projet pour libérer l&apos;emplacement
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 6. Section Comment ça marche */}
      <section id="comment-ca-marche" className="py-14 sm:py-20 px-4 sm:px-6 max-w-[1200px] mx-auto border-t border-[#eaebee]">
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-6 sm:mb-10">
          <Tag variant="ice">Fonctionnement simplifié</Tag>
          <h2 className="text-[26px] sm:text-[34px] font-bold tracking-tight text-[#000000]">
            Comment ça marche ?
          </h2>
          <p className="text-[14px] sm:text-[15px] text-[#666666]">
            Une infrastructure entièrement automatisée pour piloter, préserver et restaurer vos bases Supabase.
          </p>
        </div>

        <HowItWorks />
      </section>

      {/* 7. Appel à l'action final (CTA) */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-[1200px] mx-auto text-center border-t border-[#eaebee]">
        <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6">
          <h2 className="text-[26px] sm:text-[34px] font-bold tracking-tight text-[#000000]">
            Prêt à optimiser la gestion de vos projets Supabase ?
          </h2>
          <p className="text-[14px] sm:text-[15px] text-[#666666]">
            Rejoignez les développeurs qui utilisent SupaHub pour prototyper et maintenir leurs applications sans contrainte.
          </p>
          <div className="flex justify-center pt-2">
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto px-8">
                Démarrer gratuitement
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Pied de page (Large Name Footer Pixso) */}
      <Footer />
    </div>
  );
}
