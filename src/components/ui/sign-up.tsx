"use client";

import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useCallback,
  Children,
} from "react";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCcw,
  AlertCircle,
  PartyPopper,
  Loader,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useInView,
  Variants,
  Transition,
} from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseOAuthUrl } from "@/app/actions";

// --- CONFETTI LOGIC ---
import type {
  GlobalOptions as ConfettiGlobalOptions,
  CreateTypes as ConfettiInstance,
  Options as ConfettiOptions,
} from "canvas-confetti";
import confetti from "canvas-confetti";

type Api = { fire: (options?: ConfettiOptions) => void };
export type ConfettiRef = Api | null;

const Confetti = forwardRef<
  ConfettiRef,
  React.ComponentPropsWithRef<"canvas"> & {
    options?: ConfettiOptions;
    globalOptions?: ConfettiGlobalOptions;
    manualstart?: boolean;
  }
>((props, ref) => {
  const {
    options,
    globalOptions = { resize: true, useWorker: true },
    manualstart = false,
    ...rest
  } = props;
  const instanceRef = useRef<ConfettiInstance | null>(null);
  const canvasRef = useCallback(
    (node: HTMLCanvasElement) => {
      if (node !== null) {
        if (instanceRef.current) return;
        instanceRef.current = confetti.create(node, {
          ...globalOptions,
          resize: true,
        });
      } else {
        if (instanceRef.current) {
          instanceRef.current.reset();
          instanceRef.current = null;
        }
      }
    },
    [globalOptions]
  );
  const fire = useCallback(
    (opts = {}) => instanceRef.current?.({ ...options, ...opts }),
    [options]
  );
  const api = useMemo(() => ({ fire }), [fire]);
  useImperativeHandle(ref, () => api, [api]);
  useEffect(() => {
    if (!manualstart) fire();
  }, [manualstart, fire]);
  return <canvas ref={canvasRef} {...rest} />;
});
Confetti.displayName = "Confetti";

// --- TEXT LOOP ANIMATION COMPONENT ---
type TextLoopProps = {
  children: React.ReactNode[];
  className?: string;
  interval?: number;
  transition?: Transition;
  variants?: Variants;
  onIndexChange?: (index: number) => void;
  stopOnEnd?: boolean;
};
export function TextLoop({
  children,
  className,
  interval = 1.4,
  transition = { duration: 0.3 },
  variants,
  onIndexChange,
  stopOnEnd = false,
}: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = Children.toArray(children);
  useEffect(() => {
    const intervalMs = interval * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((current) => {
        if (stopOnEnd && current === items.length - 1) {
          clearInterval(timer);
          return current;
        }
        const next = (current + 1) % items.length;
        onIndexChange?.(next);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, interval, onIndexChange, stopOnEnd]);
  const motionVariants: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  };
  return (
    <div className={className}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={currentIndex}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          variants={variants || motionVariants}
        >
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- BLUR FADE ANIMATION ---
interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  yOffset?: number;
  inView?: boolean;
}
function BlurFade({
  children,
  className,
  duration = 0.4,
  delay = 0,
  yOffset = 6,
  inView = true,
}: BlurFadeProps) {
  const ref = useRef(null);
  const inViewResult = useInView(ref, { once: true });
  const isInView = !inView || inViewResult;
  const defaultVariants: Variants = {
    hidden: { y: yOffset, opacity: 0, filter: "blur(6px)" },
    visible: { y: 0, opacity: 1, filter: "blur(0px)" },
  };
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      exit="hidden"
      variants={defaultVariants}
      transition={{ delay: 0.04 + delay, duration, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// --- OFFICIAL SUPABASE LOGO SVG ---
const SupabaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M21.362 9.354H12V.304a.304.304 0 0 0-.52-.214L.09 11.482a.304.304 0 0 0 .215.518H9.64v9.05a.304.304 0 0 0 .52.215L21.576 9.872a.304.304 0 0 0-.214-.518z"
      fill="#3ECF8E"
    />
  </svg>
);

const modalSteps = [
  { message: "Redirection vers Supabase...", icon: <Loader className="w-10 h-10 text-[#3ECF8E] animate-spin" /> },
  { message: "Autorisation des accès...", icon: <Loader className="w-10 h-10 text-[#4e6fff] animate-spin" /> },
  { message: "Synchronisation de la flotte...", icon: <Loader className="w-10 h-10 text-[#ee7cff] animate-spin" /> },
  { message: "Bienvenue sur SupaHub !", icon: <PartyPopper className="w-10 h-10 text-[#000000]" /> },
];
const TEXT_LOOP_INTERVAL = 1.4;

const DefaultLogo = () => (
  <Link href="/" className="flex items-center gap-2">
    <div className="h-6 w-6 rounded-[6px] bg-gradient-to-tr from-[#ee7cff] via-[#4e6fff] to-[#559cff]" />
    <span className="font-bold text-[18px] tracking-tight text-[#000000]">SupaHub</span>
  </Link>
);

export interface AuthComponentProps {
  logo?: React.ReactNode;
  brandName?: string;
}

export function AuthComponent({ logo = <DefaultLogo /> }: AuthComponentProps) {
  const [loadingAction, setLoadingAction] = useState(false);
  const [modalStatus, setModalStatus] = useState<"closed" | "loading" | "error" | "success">("closed");
  const [modalErrorMessage, setModalErrorMessage] = useState("");
  const confettiRef = useRef<ConfettiRef>(null);

  const supabase = createClient();

  const fireSideCanons = () => {
    const fire = confettiRef.current?.fire;
    if (fire) {
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
      const particleCount = 45;
      fire({ ...defaults, particleCount, origin: { x: 0, y: 1 }, angle: 60 });
      fire({ ...defaults, particleCount, origin: { x: 1, y: 1 }, angle: 120 });
    }
  };

  async function handleSupabaseOAuthLogin() {
    setLoadingAction(true);
    setModalStatus("loading");
    setModalErrorMessage("");

    try {
      // 1. Appel du serveur pour générer l'URL d'autorisation Supabase OAuth
      const res = await getSupabaseOAuthUrl(window.location.origin);
      if (res?.url) {
        window.location.href = res.url;
        return;
      }
      throw new Error("Impossible de générer l'URL d'autorisation Supabase.");
    } catch (err: any) {
      setModalErrorMessage(
        err?.message || "Une erreur est survenue lors de la connexion."
      );
      setModalStatus("error");
      setLoadingAction(false);
    }
  }

  const closeModal = () => {
    setModalStatus("closed");
    setModalErrorMessage("");
    setLoadingAction(false);
  };

  useEffect(() => {
    if (modalStatus === "success") {
      fireSideCanons();
    }
  }, [modalStatus]);

  const Modal = () => (
    <AnimatePresence>
      {modalStatus !== "closed" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            className="relative bg-white border border-[#eaebee] rounded-[20px] p-7 w-full max-w-sm flex flex-col items-center gap-4 text-center shadow-xl font-figtree"
          >
            {modalStatus === "error" && (
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 p-1.5 text-[#808080] hover:text-[#000000] transition-colors rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {modalStatus === "error" && (
              <>
                <AlertCircle className="w-10 h-10 text-[#e03b24]" />
                <p className="text-[15px] font-semibold text-[#000000]">Erreur d&apos;authentification</p>
                <p className="text-[13px] text-[#666666] leading-relaxed">{modalErrorMessage}</p>
                <button
                  onClick={closeModal}
                  className="glass3d px-5 py-2 rounded-full bg-[#121212] text-white text-[13px] font-medium mt-2 cursor-pointer"
                >
                  <span className="relative z-10">Réessayer</span>
                </button>
              </>
            )}
            {modalStatus === "loading" && (
              <TextLoop interval={TEXT_LOOP_INTERVAL} stopOnEnd={true}>
                {modalSteps.slice(0, -1).map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-3">
                    {step.icon}
                    <p className="text-[15px] font-medium text-[#000000]">{step.message}</p>
                  </div>
                ))}
              </TextLoop>
            )}
            {modalStatus === "success" && (
              <div className="flex flex-col items-center gap-3">
                {modalSteps[modalSteps.length - 1].icon}
                <p className="text-[16px] font-semibold text-[#000000]">
                  {modalSteps[modalSteps.length - 1].message}
                </p>
                <p className="text-[13px] text-[#666666]">Redirection vers votre dashboard...</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="bg-[#faf8fd] text-[#000000] min-h-screen w-full flex flex-col font-figtree relative overflow-hidden">
      {/* Vidéo d'arrière-plan couvrant toute la page */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-75 pointer-events-none"
      >
        <source
          src="/videos/Glowing_spores_drifting_in_forest_20260930174232.mp4"
          type="video/mp4"
        />
      </video>
      <div className="absolute inset-0 bg-[#faf8fd]/30 z-0 pointer-events-none" />
      <div className="absolute size-[32rem] rounded-full bg-[#cfe7ed]/35 blur-[8rem] top-1/3 left-1/2 -translate-x-1/2 z-0 pointer-events-none" />

      <Confetti
        ref={confettiRef}
        manualstart
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-[999]"
      />
      <Modal />

      {/* Header Bar */}
      <div className="fixed top-5 inset-x-0 z-20 flex items-center justify-between px-6 max-w-[1200px] mx-auto">
        {logo}
        <Link
          href="/"
          className="text-[13px] font-medium text-[#666666] hover:text-[#000000] transition"
        >
          ← Retour au site
        </Link>
      </div>

      {/* Auth Content Frame */}
      <div className="flex w-full flex-1 items-center justify-center relative px-4 py-20 z-10">
        <div className="glass3d rounded-[24px] border border-[#eaebee]/90 p-6 sm:p-8 relative z-10 flex flex-col items-center gap-6 w-full max-w-[380px] mx-auto text-center shadow-xl">
          {/* Header text */}
          <div className="space-y-2">
            <BlurFade delay={0.1}>
              <div className="inline-flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-[7px] bg-gradient-to-tr from-[#ee7cff] via-[#4e6fff] to-[#559cff]" />
                <span className="text-[19px] font-bold tracking-tight text-[#000000]">SupaHub</span>
              </div>
              <h1 className="text-[26px] sm:text-[30px] font-bold tracking-tight text-[#000000] leading-tight">
                Connexion directe
              </h1>
            </BlurFade>
            <BlurFade delay={0.2}>
              <p className="text-[13px] sm:text-[14px] text-[#666666] leading-relaxed">
                Autorisez SupaHub à accéder à vos projets pour orchestrer et sauvegarder votre flotte en 1 clic.
              </p>
            </BlurFade>
          </div>

          {/* CTA Principal Supabase OAuth */}
          <BlurFade delay={0.3} className="w-full">
            <button
              type="button"
              onClick={handleSupabaseOAuthLogin}
              disabled={loadingAction}
              className="glass3d w-full h-12 px-5 rounded-full bg-[#121212] hover:bg-[#292929] text-[#ffffff] font-medium text-[14px] flex items-center justify-between transition-all cursor-pointer shadow-lg active:scale-[0.99] disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center gap-2.5">
                <SupabaseIcon className="h-5 w-5 shrink-0" />
                <span>Continuer avec Supabase</span>
              </span>
              <span className="relative z-10">
                <ArrowRight className="h-4 w-4 opacity-75" />
              </span>
            </button>
          </BlurFade>

          {/* Liste des garanties / fonctionnalités automatiques */}
          <BlurFade delay={0.4} className="w-full">
            <div className="rounded-[14px] bg-[#f9f9fa] border border-[#eaebee] p-3.5 text-left space-y-2.5 text-[12px] text-[#4d4d4d]">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-[#000000] shrink-0" />
                <span>Synchronisation automatique de vos projets</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-3.5 w-3.5 text-[#000000] shrink-0" />
                <span>Zéro token manuel à copier ni à renouveler</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-[#000000] shrink-0" />
                <span>Chiffrement et isolation des sauvegardes R2</span>
              </div>
            </div>
          </BlurFade>

          {/* Footer note */}
          <BlurFade delay={0.5}>
            <p className="text-[11px] text-[#808080] leading-normal">
              En vous connectant, vous autorisez SupaHub à maintenir vos bases éveillées et à gérer vos instantanés selon vos règles.
            </p>
          </BlurFade>
        </div>
      </div>
    </div>
  );
}

export default AuthComponent;
