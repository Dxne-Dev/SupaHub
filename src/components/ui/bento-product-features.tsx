"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// Variantes d'animation pour échelonner l'apparition des éléments
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Variantes d'animation pour chaque élément de la grille
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 14,
    },
  },
};

export interface BentoGridShowcaseProps {
  /** Emplacement pour la carte principale haute (Maintien Actif Automatisé) */
  integration: React.ReactNode;
  /** Emplacement haut-milieu (Bases de données connectées) */
  trackers: React.ReactNode;
  /** Emplacement haut-droite (Statistique clé) */
  statistic: React.ReactNode;
  /** Emplacement milieu-milieu (Taux de disponibilité / Heartbeat) */
  focus: React.ReactNode;
  /** Emplacement milieu-droite (Protection Anti-Pause) */
  productivity: React.ReactNode;
  /** Emplacement large bas (Raccourcis & Actions rapides) */
  shortcuts: React.ReactNode;
  /** Classes optionnelles pour le conteneur */
  className?: string;
}

/**
 * Composant Bento Grid réactif et animé, adapté au design system Pixso.
 */
export const BentoGridShowcase = ({
  integration,
  trackers,
  statistic,
  focus,
  productivity,
  shortcuts,
  className,
}: BentoGridShowcaseProps) => {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={cn(
        "grid w-full grid-cols-1 gap-5 md:grid-cols-3",
        "md:grid-rows-3",
        "auto-rows-[minmax(180px,auto)]",
        className
      )}
    >
      {/* Emplacement 1: Grand panneau vertical gauche (occupe 3 rangées) */}
      <motion.div variants={itemVariants} className="md:col-span-1 md:row-span-3">
        {integration}
      </motion.div>

      {/* Emplacement 2: Trackers connectés */}
      <motion.div variants={itemVariants} className="md:col-span-1 md:row-span-1">
        {trackers}
      </motion.div>

      {/* Emplacement 3: Statistique */}
      <motion.div variants={itemVariants} className="md:col-span-1 md:row-span-1">
        {statistic}
      </motion.div>

      {/* Emplacement 4: Taux de disponibilité */}
      <motion.div variants={itemVariants} className="md:col-span-1 md:row-span-1">
        {focus}
      </motion.div>

      {/* Emplacement 5: Protection continue */}
      <motion.div variants={itemVariants} className="md:col-span-1 md:row-span-1">
        {productivity}
      </motion.div>

      {/* Emplacement 6: Raccourcis & Actions rapides (occupe 2 colonnes) */}
      <motion.div variants={itemVariants} className="md:col-span-2 md:row-span-1">
        {shortcuts}
      </motion.div>
    </motion.section>
  );
};
