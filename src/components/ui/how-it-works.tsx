"use client";

import React from "react";
import { motion } from "framer-motion";

interface CardProps {
  number: string;
  title: string;
  description: string;
  colorTheme?: "ice" | "iris" | "orchid" | "sky";
  className?: string;
  rotate?: string;
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
}

const Pin = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046 -.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" />
  </svg>
);

const Card = ({
  number,
  title,
  description,
  colorTheme = "ice",
  className = "",
  rotate = "",
  colors: customColors,
}: CardProps) => {
  const defaultBgColors = {
    ice: "bg-[#cfe7ed]/25",
    iris: "bg-[#4e6fff]/10",
    orchid: "bg-[#ee7cff]/10",
    sky: "bg-[#559cff]/10",
  };
  const defaultTextColors = {
    ice: "text-[#000000]",
    iris: "text-[#4e6fff]",
    orchid: "text-[#ee7cff]",
    sky: "text-[#559cff]",
  };
  const defaultBorderColors = {
    ice: "border-[#cfe7ed]",
    iris: "border-[#4e6fff]/30",
    orchid: "border-[#ee7cff]/30",
    sky: "border-[#559cff]/30",
  };

  const bgColor = customColors?.bg || defaultBgColors[colorTheme] || defaultBgColors.ice;
  const textColor = customColors?.text || defaultTextColors[colorTheme] || defaultTextColors.ice;
  const borderColor = customColors?.border || defaultBorderColors[colorTheme] || defaultBorderColors.ice;

  return (
    <div
      className={`relative w-full md:w-[300px] transition-all duration-300 hover:z-30 hover:scale-[1.03] ${rotate} ${className}`}
    >
      <div className="bg-[#ffffff] p-2.5 rounded-[22px] shadow-[rgba(0,0,0,0.06)_0px_8px_20px_0px,rgba(0,0,0,0.04)_0px_0px_1px_0px] border border-[#eaebee]">
        <Pin className={`w-7 h-7 ${textColor} z-20 mb-4 mx-auto`} />
        <div
          className={`${bgColor} border ${borderColor} rounded-[14px] p-4 sm:p-5 h-full flex flex-col relative overflow-hidden`}
        >
          <span
            className={`${textColor} text-3xl sm:text-4xl font-mono font-bold mb-3 tracking-tight`}
          >
            {number}
          </span>
          <h3 className="text-[17px] sm:text-[18px] font-semibold text-[#000000] leading-snug mb-2 font-figtree">
            {title}
          </h3>
          <p className="text-[#666666] text-[13px] leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export interface Step {
  title: string;
  description: string;
  colorTheme?: "ice" | "iris" | "orchid" | "sky";
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
}

export interface StepPosition {
  className?: string;
  rotate?: string;
}

export interface HowItWorksProps {
  features?: Step[];
  className?: string;
  stepPositions?: StepPosition[];
}

const DEFAULT_CARD_POSITIONS: StepPosition[] = [
  { className: "md:absolute md:top-0 md:left-[10%] lg:md:left-[14%]", rotate: "rotate-2 md:rotate-4" },
  {
    className: "md:absolute md:top-[160px] md:right-[10%] lg:md:right-[14%]",
    rotate: "-rotate-2 md:-rotate-4",
  },
  { className: "md:absolute md:top-[440px] md:left-[10%] lg:md:left-[14%]", rotate: "rotate-2 md:rotate-4" },
  {
    className: "md:absolute md:top-[600px] md:right-[10%] lg:md:right-[14%]",
    rotate: "-rotate-2 md:-rotate-4",
  },
];

export function HowItWorks({
  features,
  className = "",
  stepPositions,
}: HowItWorksProps) {
  const defaultFeatures: Step[] = [
    {
      title: "Connexion sécurisée via PAT",
      description:
        "Renseignez votre jeton d'accès Supabase en toute sécurité. Vos clés sont chiffrées de bout en bout en AES-256-GCM.",
      colorTheme: "ice",
    },
    {
      title: "Maintien actif automatisé",
      description:
        "SupaHub supervise vos projets et envoie une requête de veille toutes les 72h pour empêcher la mise en pause automatique.",
      colorTheme: "iris",
    },
    {
      title: "Gel & Archivage vers R2",
      description:
        "Libérez vos 2 emplacements gratuits en archivant vos schémas et données compressés vers Cloudflare R2 en 1 clic.",
      colorTheme: "orchid",
    },
    {
      title: "Restauration instantanée",
      description:
        "Besoin de reprendre un projet ? Restaurez l'intégralité de vos tables et configurations sur une nouvelle instance en un éclair.",
      colorTheme: "sky",
    },
  ];

  const data = features && features.length > 0 ? features : defaultFeatures;
  const positions = stepPositions || DEFAULT_CARD_POSITIONS;

  const height = 920;

  return (
    <div
      className={`relative w-full max-md:pt-6 max-md:pb-12 md:py-16 px-4 sm:px-8 ${className}`}
    >
      {/* Fond ligné subtil Pixso */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: "linear-gradient(#eaebee 1px, transparent 1px)",
          backgroundSize: "100% 36px",
          marginTop: "4px",
        }}
      />
      <div className="from-[#faf8fd] pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r" />
      <div className="from-[#faf8fd] pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div
          className="relative w-full max-w-[960px] mx-auto flex flex-col space-y-6 md:space-y-0 md:block h-auto md:h-[var(--md-height)]"
          style={{ "--md-height": `${height}px` } as React.CSSProperties}
        >
          {data.length > 1 && (
            <svg
              className="absolute top-0 left-0 w-full h-full pointer-events-none hidden md:block z-0"
              viewBox={`0 0 960 ${height}`}
              preserveAspectRatio="none"
            >
              {(() => {
                const pathD = "M 320 130 C 520 130, 560 260, 680 260 C 800 260, 520 440, 320 540 C 320 660, 560 700, 680 700";
                return (
                  <motion.path
                    d={pathD}
                    stroke="currentColor"
                    className="text-[#999999]/50"
                    strokeWidth="2"
                    strokeDasharray="8 6"
                    fill="none"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    initial={{ strokeDashoffset: 0 }}
                    animate={{
                      strokeDashoffset: -140,
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                );
              })()}
            </svg>
          )}

          {data.map((step, index) => {
            const position = positions[index % positions.length];

            return (
              <Card
                key={step.title}
                number={`0${index + 1}`}
                title={step.title}
                description={step.description}
                colorTheme={step.colorTheme || "ice"}
                colors={step.colors}
                rotate={position.rotate}
                className={position.className}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;
