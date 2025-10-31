import { Sparkles, Star, Zap } from "lucide-react";
import type * as React from "react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

interface NotFoundAnimatedProps extends React.ComponentProps<"div"> {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  showSearchButton?: boolean;
  onBack?: () => void;
  onHome?: () => void;
  onSearch?: () => void;
  customActions?: React.ReactNode;
  enableFloatingElements?: boolean;
  enableGlitchEffect?: boolean;
}

function NotFoundAnimated({
  className,
  title = "404",
  description = "Looks like you've ventured into uncharted territory.",
  showBackButton = true,
  showHomeButton = true,
  showSearchButton = false,
  onBack,
  onHome,
  onSearch,
  customActions,
  enableFloatingElements = true,
  enableGlitchEffect = true,
  ...props
}: NotFoundAnimatedProps) {
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>(
    [],
  );
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isGlitching, setIsGlitching] = useState(false);

  // Initialize floating elements
  useEffect(() => {
    if (!enableFloatingElements) return;

    const elements: FloatingElement[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 10,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.6 + 0.2,
    }));

    setFloatingElements(elements);
  }, [enableFloatingElements]);

  // Animate floating elements
  useEffect(() => {
    if (!enableFloatingElements || floatingElements.length === 0) return;

    const interval = setInterval(() => {
      setFloatingElements((prev) =>
        prev.map((element) => ({
          ...element,
          y: (element.y + element.speed * 0.1) % 110,
          x: element.x + Math.sin(Date.now() * 0.001 + element.id) * 0.1,
        })),
      );
    }, 50);

    return () => clearInterval(interval);
  }, [enableFloatingElements, floatingElements.length]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Glitch effect
  useEffect(() => {
    if (!enableGlitchEffect) return;

    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.1) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 150);
      }
    }, 3000);

    return () => clearInterval(glitchInterval);
  }, [enableGlitchEffect]);

  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden bg-linear-to-br from-background via-muted/10 to-background",
        className,
      )}
      {...props}
    >
      {/* Floating background elements */}
      {enableFloatingElements && (
        <div className="pointer-events-none absolute inset-0">
          {floatingElements.map((element) => (
            <div
              key={element.id}
              className="absolute animate-pulse"
              style={{
                left: `${element.x}%`,
                top: `${element.y}%`,
                transform: `translate(-50%, -50%) scale(${element.size / 20})`,
                opacity: element.opacity,
              }}
            >
              {element.id % 3 === 0 ? (
                <Sparkles className="size-4 text-primary/30" />
              ) : element.id % 3 === 1 ? (
                <Zap className="size-4 text-primary/20" />
              ) : (
                <Star className="size-4 text-primary/25" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Mouse follower */}
      <div
        className="pointer-events-none absolute size-96 rounded-full bg-primary/5 blur-3xl transition-all duration-1000 ease-out"
        style={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Main content */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="flex w-full max-w-lg flex-col items-center gap-8 text-center">
          {/* Animated 404 number */}
          <div className="relative">
            <div
              className={cn(
                "select-none font-bold text-8xl tracking-tighter transition-all duration-300 md:text-9xl",
                enableGlitchEffect && isGlitching
                  ? "animate-pulse text-destructive"
                  : "bg-linear-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent hover:from-primary/90 hover:via-primary hover:to-primary/90",
              )}
              style={{
                textShadow: isGlitching
                  ? "2px 0 #ff0000, -2px 0 #00ff00, 0 2px #0000ff"
                  : "none",
              }}
            >
              {title}
            </div>

            {/* Glitch overlay */}
            {enableGlitchEffect && isGlitching && (
              <div className="absolute inset-0 select-none font-bold text-8xl text-primary/20 tracking-tighter md:text-9xl">
                {title}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
              Lost in the Digital Void
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
              {description}
            </p>
          </div>

          {/* Interactive elements */}
          {/* <div className="flex flex-col gap-4"> */}
          {/* Animated search suggestion */}
          {/* <div className="group relative overflow-hidden rounded-lg border bg-card/50 p-4 backdrop-blur-sm transition-all hover:bg-card/80">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Search className="size-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Try searching instead</p>
                  <p className="text-muted-foreground text-xs">
                    Find what you're looking for
                  </p>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div> */}

          {/* Action buttons */}
          {/* <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              {showBackButton && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="group flex items-center gap-2 transition-all hover:scale-105"
                >
                  <ArrowLeft className="group-hover:-translate-x-1 size-4 transition-transform" />
                  Go Back
                </Button>
              )}

              {showHomeButton && (
                <Button
                  onClick={handleHome}
                  className="group flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Home className="size-4 transition-transform group-hover:scale-110" />
                  Home
                </Button>
              )}

              {showSearchButton && (
                <Button
                  variant="outline"
                  onClick={handleSearch}
                  className="group flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Search className="size-4 transition-transform group-hover:rotate-12" />
                  Search
                </Button>
              )}

              {customActions}
            </div> */}
          {/* </div> */}
        </div>
      </div>
    </div>
  );
}

export { NotFoundAnimated };
