import { useState } from "react";
import { useAuth, type OnboardingData } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, MapPin, Globe, User as UserIcon } from "lucide-react";

export function OnboardingModal() {
  const { onboardingProfile, completeOnboarding, isOnboarding } = useAuth();

  const [formData, setFormData] = useState<OnboardingData>({
    name: onboardingProfile?.name || "",
    location: "",
    availability: "both",
    bio: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim()) return;
    completeOnboarding(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg shadow-2xl border-primary/20 animate-in fade-in zoom-in-95 duration-300 bg-white dark:bg-slate-900">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-display font-bold">Complete Your SkillSwap Profile</CardTitle>
          <CardDescription>
            Tell the community a little about yourself to start swapping skills. You'll receive <span className="font-semibold text-primary">5 Skill Credits</span> to get started!
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1.5">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="e.g. Alex Rivera"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Location
              </Label>
              <Input
                id="location"
                placeholder="e.g. San Francisco, CA or London, UK"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability" className="flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-muted-foreground" />
                Preferred Swap Mode
              </Label>
              <Select
                value={formData.availability}
                onValueChange={(val: "online" | "offline" | "both") =>
                  setFormData({ ...formData, availability: val })
                }
              >
                <SelectTrigger id="availability">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online only (Video sessions)</SelectItem>
                  <SelectItem value="offline">In-person / Offline</SelectItem>
                  <SelectItem value="both">Both (Online and In-person)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio & Background (Optional)</Label>
              <Textarea
                id="bio"
                placeholder="Share your interests, skills, or what you're excited to learn..."
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-6 text-base font-semibold py-5"
              disabled={isOnboarding || !formData.name.trim() || !formData.location.trim()}
            >
              {isOnboarding ? "Setting up profile..." : "Start Swapping (+5 Credits)"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
