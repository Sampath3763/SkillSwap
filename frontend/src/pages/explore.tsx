import { useState } from "react";
import { useSkills } from "@/hooks/use-skills";
import { useCreateSwap } from "@/hooks/use-swaps";
import { useAuth } from "@/hooks/use-auth";
import { SkillCard } from "@/components/skill-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function Explore() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"OFFERED" | "WANTED">("OFFERED");
  
  // Fetch ALL skills (except user's own and completed sessions)
  const { data: skills, isLoading } = useSkills({ 
    search, 
    type: filterType,
    excludeCompletedFor: user?.id 
  });
  const { data: mySkills } = useSkills({ userId: user?.id, type: "OFFERED" });
  const { data: myWantedSkills } = useSkills({ userId: user?.id, type: "WANTED" });
  
  const createSwap = useCreateSwap();
  const [selectedSkill, setSelectedSkill] = useState<any>(null); // Skill we want to swap for
  const [myOfferSkillId, setMyOfferSkillId] = useState<string>("");
  const [isCommunityRequest, setIsCommunityRequest] = useState(false);

  const filteredSkills = skills?.filter(s => s.userId !== user?.id) || [];
  
  // Check if user has required skills
  const hasOfferedSkills = mySkills && mySkills.length > 0;
  const hasWantedSkills = myWantedSkills && myWantedSkills.length > 0;
  // Users can now always explore (for community requests)
  const canExplore = true;

  const handleRequestSwap = () => {
    if (!selectedSkill) return;
    if (!isCommunityRequest && !myOfferSkillId) return;

    createSwap.mutate({
      initiatorId: user!.id,
      receiverId: selectedSkill.userId,
      wantSkillId: selectedSkill.id,
      ...(isCommunityRequest ? {} : { offerSkillId: parseInt(myOfferSkillId) }),
    }, {
      onSuccess: () => {
        setSelectedSkill(null);
        setMyOfferSkillId("");
        setIsCommunityRequest(false);
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Explore Skills</h1>
          <p className="text-muted-foreground">Find people offering what you want to learn.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search skills..." 
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={!canExplore}
            />
          </div>
          <Select 
            value={filterType} 
            onValueChange={(v: "OFFERED" | "WANTED") => setFilterType(v)}
            disabled={!canExplore}
          >
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OFFERED">Offers</SelectItem>
              <SelectItem value="WANTED">Requests</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!hasWantedSkills && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">👋 New here?</h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            You can request mentorship from experienced users even without offering a skill in return. 
            Just check "Community Request" when requesting help!
          </p>
        </div>
      )}

      {!canExplore ? (
        <div className="text-center py-20 bg-destructive/10 rounded-xl border-2 border-destructive/20">
          <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Complete Your Profile First</h3>
            <p className="text-muted-foreground">
              Before you can explore and request skill swaps, you need to:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              {!hasOfferedSkills && (
                <li className="flex items-center justify-center gap-2">
                  <span className="text-destructive">✗</span>
                  Add at least one skill you can <strong>offer</strong>
                </li>
              )}
              {!hasWantedSkills && (
                <li className="flex items-center justify-center gap-2">
                  <span className="text-destructive">✗</span>
                  Add at least one skill you <strong>want</strong> to learn
                </li>
              )}
            </ul>
            <Button 
              onClick={() => window.location.href = '/my-skills'}
              className="mt-4"
            >
              Go to My Skills
            </Button>
          </div>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filteredSkills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => (
            <SkillCard 
              key={skill.id} 
              skill={skill} 
              onRequestSwap={() => setSelectedSkill(skill)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <p className="text-muted-foreground">No skills found matching your criteria.</p>
        </div>
      )}

      {/* Swap Request Dialog */}
      <Dialog open={!!selectedSkill} onOpenChange={(open) => {
        if (!open) {
          setSelectedSkill(null);
          setIsCommunityRequest(false);
          setMyOfferSkillId("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Help</DialogTitle>
            <DialogDescription>
              You want to learn <strong>{selectedSkill?.name}</strong> from {selectedSkill?.user?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <input
                type="checkbox"
                id="communityRequest"
                checked={isCommunityRequest}
                onChange={(e) => {
                  setIsCommunityRequest(e.target.checked);
                  if (e.target.checked) setMyOfferSkillId("");
                }}
                className="w-4 h-4"
              />
              <label htmlFor="communityRequest" className="text-sm cursor-pointer">
                <strong>Community Request</strong> - Ask for mentorship (no skill exchange required)
              </label>
            </div>

            {!isCommunityRequest && (
              <div className="space-y-2">
                <Label>Select a skill you offer in return</Label>
                <Select value={myOfferSkillId} onValueChange={setMyOfferSkillId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a skill..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mySkills?.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name} ({s.level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(!mySkills || mySkills.length === 0) && (
                  <p className="text-xs text-destructive mt-1">
                    You haven't added any skills to offer yet. Check "Community Request" to ask for mentorship instead.
                  </p>
                )}
              </div>
            )}

            <Button 
              className="w-full" 
              onClick={handleRequestSwap}
              disabled={createSwap.isPending || (!isCommunityRequest && !myOfferSkillId)}
            >
              {createSwap.isPending ? "Sending Request..." : isCommunityRequest ? "Request Mentorship" : "Send Swap Request"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
