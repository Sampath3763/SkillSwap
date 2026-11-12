import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";

export function useCreateReview() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: { swapId: number; revieweeId: number; rating: number; comment: string }) => {
      const res = await fetch(api.reviews.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review),
      });
      if (!res.ok) throw new Error("Failed to submit review");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.swaps.list.path] });
      toast({ 
        title: "Review Submitted", 
        description: "Thank you for your feedback!" 
      });
    },
    onError: (err: Error) => {
      toast({ 
        title: "Error", 
        description: err.message, 
        variant: "destructive" 
      });
    },
  });
}
