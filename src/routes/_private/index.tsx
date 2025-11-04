import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { auth } from "@/lib/auth/auth-client";
import { getuserId } from "@/lib/auth/server-fn";

export const Route = createFileRoute("/_private/")({
  component: App,
});

function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative">
          <Construction
            className="size-20 animate-bounce text-primary"
            strokeWidth={1.5}
          />
          <div className="absolute inset-0 size-20 animate-ping rounded-full border-2 border-primary/20" />
        </div>
        <div className="space-y-2">
          <h1 className="font-bold text-4xl text-foreground tracking-tight">
            Under Construction
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">
            We're working hard to bring you something amazing. Please check back
            soon!
          </p>
        </div>
        <div className="mt-4 flex items-center gap-2 text-muted-foreground text-sm">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span>Coming soon</span>
        </div>
      </div>
    </div>
  );
}
