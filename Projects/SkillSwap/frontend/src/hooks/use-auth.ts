import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser, useClerk } from "@clerk/react";
import { api, type LoginRequest, type RegisterRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { setClerkUserId } from "@/lib/api";

export interface User {
  id: number;
  clerkId?: string;
  username: string;
  name: string;
  location: string;
  availability: string;
  bio: string | null;
  credits: number;
  rating: number;
  createdAt: Date | string | null;
}

export interface OnboardingData {
  name: string;
  location: string;
  availability: "online" | "offline" | "both";
  bio?: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [onboardingProfile, setOnboardingProfile] = useState<{
    name?: string;
    username?: string;
    email?: string;
  } | null>(null);

  // Sync Clerk User with MongoDB Backend
  useEffect(() => {
    if (!isClerkLoaded) return;

    if (isSignedIn && clerkUser) {
      setClerkUserId(clerkUser.id);
      
      const email = clerkUser.primaryEmailAddress?.emailAddress;
      const name = clerkUser.fullName || clerkUser.firstName || clerkUser.username || "SkillSwapper";
      const username = clerkUser.username || email?.split("@")[0] || "user";

      fetch("/api/user/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-clerk-user-id": clerkUser.id,
        },
        body: JSON.stringify({
          clerkId: clerkUser.id,
          email,
          name,
          username,
          imageUrl: clerkUser.imageUrl,
        }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("Sync failed");
          return res.json();
        })
        .then((data) => {
          if (data.needsOnboarding) {
            setNeedsOnboarding(true);
            setOnboardingProfile({
              name,
              username,
              email,
            });
            if (data.user) {
              queryClient.setQueryData([api.auth.me.path], data.user);
            }
          } else if (data.user) {
            setNeedsOnboarding(false);
            queryClient.setQueryData([api.auth.me.path], data.user);
          }
        })
        .catch((err) => {
          console.error("Clerk user sync error:", err);
        });
    } else {
      setClerkUserId(null);
      setNeedsOnboarding(false);
    }
  }, [isClerkLoaded, isSignedIn, clerkUser, queryClient]);

  // Main User Query
  const userQuery = useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const res = await fetch(api.auth.me.path);
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return (await res.json()) as User;
    },
    retry: false,
  });

  // Onboarding Mutation for new users
  const onboardingMutation = useMutation({
    mutationFn: async (details: OnboardingData) => {
      if (!clerkUser) throw new Error("Clerk user not found");

      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-clerk-user-id": clerkUser.id,
        },
        body: JSON.stringify({
          clerkId: clerkUser.id,
          name: details.name,
          location: details.location,
          availability: details.availability,
          bio: details.bio,
          username: clerkUser.username || clerkUser.primaryEmailAddress?.emailAddress?.split("@")[0],
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to complete profile");
      }

      const data = await res.json();
      return data.user as User;
    },
    onSuccess: (savedUser) => {
      setNeedsOnboarding(false);
      queryClient.setQueryData([api.auth.me.path], savedUser);
      toast({
        title: "Welcome to SkillSwap! 🎉",
        description: "Your profile is set up and you've been awarded 5 Skill Credits!",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Setup Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // Fallback direct login (e.g. for demo users)
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const res = await fetch(api.auth.login.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid username or password");
        throw new Error("Login failed");
      }
      return (await res.json()) as User;
    },
    onSuccess: (user) => {
      queryClient.setQueryData([api.auth.me.path], user);
      toast({ title: "Welcome back!", description: `Logged in as ${user.username}` });
    },
    onError: (error) => {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    },
  });

  // Fallback direct register
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const res = await fetch(api.auth.register.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Registration failed");
      }
      return (await res.json()) as User;
    },
    onSuccess: (user) => {
      queryClient.setQueryData([api.auth.me.path], user);
      toast({ title: "Account Created", description: "Welcome to SkillSwap!" });
    },
    onError: (error) => {
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
    },
  });

  // Logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      setClerkUserId(null);
      if (isSignedIn) {
        await signOut();
      }
      await fetch(api.auth.logout.path, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.me.path], null);
      queryClient.clear();
      setNeedsOnboarding(false);
      toast({ title: "Logged out", description: "See you soon!" });
    },
  });

  return {
    user: userQuery.data,
    clerkUser,
    isSignedIn,
    isLoading: userQuery.isLoading || (!isClerkLoaded && !userQuery.data),
    needsOnboarding,
    onboardingProfile,
    completeOnboarding: onboardingMutation.mutate,
    isOnboarding: onboardingMutation.isPending,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
