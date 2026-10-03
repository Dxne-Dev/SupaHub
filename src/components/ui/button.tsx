import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-figtree font-medium transition-all duration-150 ease-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-[#121212] text-[#ffffff] hover:bg-[#292929] shadow-[rgba(0,0,0,0.04)_0px_2px_4px_0px,rgba(0,0,0,0.3)_0px_0px_1px_0px] active:scale-[0.99]",
        default:
          "bg-[#121212] text-[#ffffff] hover:bg-[#292929] shadow-[rgba(0,0,0,0.04)_0px_2px_4px_0px,rgba(0,0,0,0.3)_0px_0px_1px_0px] active:scale-[0.99]",
        secondary:
          "bg-transparent text-[#000000] border border-[#eaebee] hover:border-[#999999] hover:bg-[#ffffff] shadow-[rgba(0,0,0,0.1)_0px_1px_1px_0px,rgba(0,0,0,0.4)_0px_0px_1px_0px] active:scale-[0.99]",
        outline:
          "bg-[#ffffff] text-[#000000] border border-[#eaebee] hover:border-[#999999] hover:bg-[#faf8fd] shadow-none active:scale-[0.99]",
        ghost:
          "bg-transparent text-[#3d3d3d] hover:bg-[#faf8fd] hover:text-[#000000] border-none shadow-none",
        danger:
          "bg-[#121212] text-[#ffffff] hover:bg-[#e03b24] border border-[#121212] active:scale-[0.99]",
        destructive:
          "bg-[#e03b24] text-white hover:bg-[#c9321c] border border-transparent active:scale-[0.99]",
        link: "text-[#000000] underline-offset-4 hover:underline shadow-none",
      },
      size: {
        default: "h-10 px-5 text-[14px] rounded-[12px]",
        sm: "h-8 px-3.5 text-[13px] rounded-[8px]",
        nav: "h-8 px-4 text-[14px] rounded-[8px]",
        lg: "h-12 px-7 text-[16px] rounded-[12px]",
        icon: "h-8 w-8 rounded-[8px] p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        <span className="relative z-10 inline-flex items-center justify-center gap-2">
          {children}
        </span>
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
