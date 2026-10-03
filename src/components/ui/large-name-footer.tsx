"use client";

import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="pt-12 sm:pt-16 pb-8 sm:pb-12 px-4 sm:px-6 bg-[#faf8fd] border-t border-[#eaebee] font-figtree text-[#000000] overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10 sm:gap-12">
          {/* Bloc Marque SupaHub */}
          <div className="max-w-sm space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-[8px] bg-gradient-to-tr from-[#ee7cff] via-[#4e6fff] to-[#559cff] flex items-center justify-center text-white font-bold text-xs" />
              <h2 className="text-[20px] font-bold tracking-tight text-[#000000]">SupaHub</h2>
            </Link>

            <p className="text-[13px] sm:text-[14px] text-[#666666] leading-relaxed">
              La plateforme d&apos;infrastructure dédiée aux développeurs Supabase. Maintien actif intelligent et archivage sans frais vers Cloudflare R2.
            </p>

            <div className="pt-1">
              <Link
                href="https://x.com/intent/tweet?text=J%27utilise%20SupaHub%20pour%20g%C3%A9rer%20mes%20projets%20Supabase%20sans%20limite%20de%20quota%20!"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" size="sm" className="text-[12px] sm:text-[13px]">
                  Partager vos impressions sur
                  <Icons.twitter className="ml-1.5 h-3.5 w-3.5 fill-current" />
                </Button>
              </Link>
            </div>

            <p className="text-[12px] text-[#808080] pt-1 sm:pt-2">
              © {new Date().getFullYear()} SupaHub. Tous droits réservés.
            </p>
          </div>

          {/* Colonnes de Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 text-[13px] sm:text-[14px]">
            {/* Produit */}
            <div className="space-y-3">
              <h3 className="font-semibold text-[#000000] text-[14px]">Produit</h3>
              <ul className="space-y-2 text-[#666666]">
                <li>
                  <a href="#maintien" className="hover:text-[#000000] transition">
                    Maintien actif
                  </a>
                </li>
                <li>
                  <a href="#stockage" className="hover:text-[#000000] transition">
                    Stockage R2 (Freeze)
                  </a>
                </li>
                <li>
                  <a href="#comment-ca-marche" className="hover:text-[#000000] transition">
                    Comment ça marche
                  </a>
                </li>
                <li>
                  <Link href="/login" className="hover:text-[#000000] transition">
                    Console d&apos;administration
                  </Link>
                </li>
              </ul>
            </div>

            {/* Ressources */}
            <div className="space-y-3">
              <h3 className="font-semibold text-[#000000] text-[14px]">Ressources</h3>
              <ul className="space-y-2 text-[#666666]">
                <li>
                  <Link href="https://supabase.com/docs" target="_blank" className="hover:text-[#000000] transition">
                    Doc Supabase
                  </Link>
                </li>
                <li>
                  <Link href="https://developers.cloudflare.com/r2/" target="_blank" className="hover:text-[#000000] transition">
                    Doc Cloudflare R2
                  </Link>
                </li>
                <li>
                  <Link href="https://github.com" target="_blank" className="hover:text-[#000000] transition flex items-center gap-1">
                    <Icons.gitHub className="h-3.5 w-3.5 fill-current" /> GitHub
                  </Link>
                </li>
              </ul>
            </div>

            {/* Légal */}
            <div className="space-y-3">
              <h3 className="font-semibold text-[#000000] text-[14px]">Légal</h3>
              <ul className="space-y-2 text-[#666666]">
                <li>
                  <Link href="#" className="hover:text-[#000000] transition">
                    Confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#000000] transition">
                    Conditions d&apos;utilisation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#000000] transition">
                    Mentions légales
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Grand Titre Typographique de Fin de Page (Limelight Spotlight Effect) */}
        <div className="w-full flex mt-10 sm:mt-16 items-center justify-center select-none overflow-hidden py-2 sm:py-4">
          <h1 className="fx-spotlight text-center text-[44px] xs:text-[56px] sm:text-[90px] md:text-[140px] lg:text-[180px] font-bold tracking-tight uppercase leading-none">
            SupaHub
          </h1>
        </div>
      </div>
    </footer>
  );
}
