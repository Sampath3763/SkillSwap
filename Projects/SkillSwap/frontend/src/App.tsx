import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import { LayoutShell } from "@/components/layout-shell";
import { Loader2 } from "lucide-react";

import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Explore from "@/pages/explore";
import MySkills from "@/pages/my-skills";
import Swaps from "@/pages/swaps";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

import { OnboardingModal } from "@/components/onboarding-modal";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading, isSignedIn, needsOnboarding } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && !isSignedIn) return <Redirect to="/auth" />;

  return (
    <>
      {needsOnboarding && <OnboardingModal />}
      <LayoutShell>
        <Component />
      </LayoutShell>
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/explore">
        <ProtectedRoute component={Explore} />
      </Route>
      <Route path="/my-skills">
        <ProtectedRoute component={MySkills} />
      </Route>
      <Route path="/swaps">
        <ProtectedRoute component={Swaps} />
      </Route>
      <Route path="/profile">
        <ProtectedRoute component={Profile} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
