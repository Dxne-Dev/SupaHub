import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#000000] text-[#ffffff] hover:bg-[#000000]/80",
        secondary:
          "border-transparent bg-[#f9f9fa] text-[#000000] hover:bg-[#f9f9fa]/80 border-[#eaebee]",
        destructive:
          "border-transparent bg-[#e03b24] text-white hover:bg-[#e03b24]/80",
        outline: "text-[#000000] border-[#eaebee]",
        ice: "bg-[#cfe7ed] text-[#000000] border-[#cfe7ed]",
        success: "bg-[#3ECF8E]/10 text-[#000000] border-[#3ECF8E]/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "ice";
}

export function Tag({ className, variant = "default", ...props }: TagProps) {
  const variantStyles = {
    default: "bg-[#f9f9fa] text-[#666666] border-[#eaebee]",
    success: "bg-[#ffffff] text-[#121212] border-[#eaebee]",
    warning: "bg-[#cfe7ed]/40 text-[#000000] border-[#cfe7ed]",
    danger: "bg-[#ffffff] text-[#e03b24] border-[#eaebee]",
    ice: "bg-[#cfe7ed] text-[#000000] border-[#cfe7ed]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[6px] border px-2 py-0.5 text-[12px] font-medium tracking-tight font-figtree",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
