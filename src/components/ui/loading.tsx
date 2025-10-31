import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, RefreshCw, RotateCw } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

const loadingVariants = cva("flex items-center justify-center", {
  variants: {
    variant: {
      default: "min-h-screen w-full bg-background",
      inline: "h-auto w-auto",
      overlay: "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
      card: "min-h-[200px] w-full rounded-lg border bg-card",
      minimal: "h-auto w-auto",
    },
    size: {
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
      xl: "p-12",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

const loadingContentVariants = cva(
  "flex flex-col items-center gap-4 text-center",
  {
    variants: {
      variant: {
        default: "max-w-sm",
        inline: "gap-2",
        overlay: "max-w-sm",
        card: "max-w-xs",
        minimal: "gap-2",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const loadingSpinnerVariants = cva("animate-spin text-primary", {
  variants: {
    size: {
      sm: "size-4",
      md: "size-6",
      lg: "size-8",
      xl: "size-12",
    },
    spinnerType: {
      loader: "",
      refresh: "",
      rotate: "",
    },
  },
  defaultVariants: {
    size: "md",
    spinnerType: "loader",
  },
});

interface LoadingProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof loadingVariants>,
    VariantProps<typeof loadingSpinnerVariants> {
  message?: string;
  description?: string;
  showSpinner?: boolean;
  spinnerType?: "loader" | "refresh" | "rotate";
}

function Loading({
  className,
  variant = "default",
  size = "md",
  spinnerType = "loader",
  message = "Loading...",
  description,
  showSpinner = true,
  ...props
}: LoadingProps) {
  const SpinnerIcon = {
    loader: Loader2,
    refresh: RefreshCw,
    rotate: RotateCw,
  }[spinnerType];

  return (
    <div
      className={cn(loadingVariants({ variant, size, className }))}
      {...props}
    >
      <div className={cn(loadingContentVariants({ variant }))}>
        {showSpinner && (
          <SpinnerIcon
            className={cn(loadingSpinnerVariants({ size, spinnerType }))}
            aria-hidden="true"
          />
        )}

        {message && (
          <div className="space-y-2">
            <h2 className="font-medium text-lg tracking-tight">{message}</h2>
            {description && (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Preset variants for common use cases
function LoadingPage(props: Omit<LoadingProps, "variant">) {
  return (
    <Loading
      variant="default"
      size="lg"
      message="Loading page..."
      description="Please wait while we prepare your content."
      {...props}
    />
  );
}

function LoadingOverlay(props: Omit<LoadingProps, "variant">) {
  return (
    <Loading variant="overlay" size="md" message="Processing..." {...props} />
  );
}

function LoadingCard(props: Omit<LoadingProps, "variant">) {
  return (
    <Loading variant="card" size="md" message="Loading content..." {...props} />
  );
}

function LoadingInline(props: Omit<LoadingProps, "variant">) {
  return (
    <Loading
      variant="inline"
      size="sm"
      message="Loading..."
      showSpinner={true}
      {...props}
    />
  );
}

function LoadingMinimal(props: Omit<LoadingProps, "variant">) {
  return (
    <Loading
      variant="minimal"
      size="sm"
      message=""
      showSpinner={true}
      {...props}
    />
  );
}

// Animated dots loading
function LoadingDots({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      <div className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
      <div className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
      <div className="size-2 animate-bounce rounded-full bg-primary" />
    </div>
  );
}

// Pulse loading bars
function LoadingPulse({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      <div className="h-8 w-2 animate-pulse rounded-full bg-primary [animation-delay:-0.4s]" />
      <div className="h-6 w-2 animate-pulse rounded-full bg-primary [animation-delay:-0.2s]" />
      <div className="h-8 w-2 animate-pulse rounded-full bg-primary" />
      <div className="h-4 w-2 animate-pulse rounded-full bg-primary [animation-delay:-0.3s]" />
      <div className="h-6 w-2 animate-pulse rounded-full bg-primary [animation-delay:-0.1s]" />
    </div>
  );
}

// Skeleton loading component
function LoadingSkeleton({
  className,
  lines = 3,
  ...props
}: React.ComponentProps<"div"> & { lines?: number }) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={`skeleton-line-${i}`}
          className={cn(
            "h-4 animate-pulse rounded bg-muted",
            i === lines - 1 ? "w-3/4" : "w-full",
          )}
        />
      ))}
    </div>
  );
}

export {
  Loading,
  LoadingPage,
  LoadingOverlay,
  LoadingCard,
  LoadingInline,
  LoadingMinimal,
  LoadingDots,
  LoadingPulse,
  LoadingSkeleton,
  loadingVariants,
};
