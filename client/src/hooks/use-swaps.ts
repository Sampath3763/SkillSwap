import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertSwap } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useSwaps() {
  return useQuery({
    queryKey: [api.swaps.list.path],
    queryFn: async () => {
      const res = await fetch(api.swaps.list.path);
      if (!res.ok) throw new Error("Failed to fetch swaps");
      return api.swaps.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSwap() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (swap: InsertSwap) => {
      const res = await fetch(api.swaps.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(swap),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.swaps.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to request swap");
      }
      return api.swaps.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.swaps.list.path] });
      toast({ title: "Request Sent", description: "Swap request sent successfully!" });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateSwapStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "accepted" | "rejected" | "completed" }) => {
      const url = buildUrl(api.swaps.updateStatus.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update swap status");
      return api.swaps.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.swaps.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] }); // Credits might change
      
      const messages = {
        accepted: "Swap accepted! You can now join the meeting.",
        rejected: "Swap request rejected.",
        completed: "Swap completed! Credits transferred.",
      };
      
      toast({ title: "Status Updated", description: messages[variables.status] });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
