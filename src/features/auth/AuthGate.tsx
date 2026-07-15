import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDataSubscriptions } from "@/hooks/useDataSubscriptions";
import { useAuthStore } from "@/store/authStore";
import { LoginScreen } from "./LoginScreen";
import { OnboardingFlow } from "@/features/onboarding/OnboardingFlow";

export function AuthGate({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const profile = useAuthStore((s) => s.profile);
  const uid = useAuthStore((s) => s.firebaseUser?.uid ?? null);

  useDataSubscriptions(status === "signed_in" && profile?.onboardingCompletedAt ? uid : null);

  if (status === "loading") {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-6 py-10">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (status === "signed_out") {
    return <LoginScreen />;
  }

  if (status === "signed_in" && !profile) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-6 py-10">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (status === "signed_in" && profile && !profile.onboardingCompletedAt) {
    return <OnboardingFlow />;
  }

  return <>{children}</>;
}
