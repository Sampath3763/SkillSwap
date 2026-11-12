import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertSkill } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useSkills(params?: { userId?: number; type?: "OFFERED" | "WANTED"; search?: string; excludeCompletedFor?: number }) {
  return useQuery({
    queryKey: [api.skills.list.path, params],
    queryFn: async () => {
      const url = new URL(api.skills.list.path, window.location.origin);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) url.searchParams.append(key, String(value));
        });
      }
      
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch skills");
      return api.skills.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (skill: InsertSkill) => {
      const res = await fetch(api.skills.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skill),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.skills.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create skill");
      }
      return api.skills.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.skills.list.path] });
      toast({ title: "Skill Added", description: "Your skill has been added to your profile." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.skills.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete skill");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.skills.list.path] });
      toast({ title: "Skill Deleted", description: "The skill has been removed." });
    },
  });
}
