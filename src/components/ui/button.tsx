import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[transform,background-color,color,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:not-disabled:scale-[0.96] [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-sea-deep dark:hover:bg-aqua",
        gold: "bg-accent text-accent-foreground hover:brightness-95",
        clay: "bg-clay text-paper hover:bg-clay-deep",
        blush: "bg-blush text-paper hover:bg-blush-deep",
        plum: "bg-plum text-paper hover:bg-plum-deep",
        outline:
          "bg-transparent text-foreground shadow-[var(--shadow-border)] hover:bg-secondary",
        ghost: "bg-transparent text-foreground hover:bg-secondary",
        link: "bg-transparent text-primary underline-offset-4 hover:underline px-0",
        paper: "bg-paper text-ink hover:bg-cream",
      },
      size: {
        default: "h-11 rounded-full px-5 text-sm",
        sm: "h-9 rounded-full px-4 text-sm",
        lg: "h-12 rounded-full px-6 text-base",
        xl: "h-14 rounded-full px-8 text-base tracking-wide",
        icon: "size-11 rounded-full",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
