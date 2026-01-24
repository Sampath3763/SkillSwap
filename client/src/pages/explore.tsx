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
  
  // Fetch ALL skills (except user's own ideally, but filtered below)
  const { data: skills, isLoading } = useSkills({ search, type: filterType });
  const { data: mySkills } = useSkills({ userId: user?.id, type: "OFFERED" });
  
  const createSwap = useCreateSwap();
  const [selectedSkill, setSelectedSkill] = useState<any>(null); // Skill we want to swap for
  const [myOfferSkillId, setMyOfferSkillId] = useState<string>("");

  const filteredSkills = skills?.filter(s => s.userId !== user?.id) || [];

  const handleRequestSwap = () => {
    if (!selectedSkill || !myOfferSkillId) return;

    createSwap.mutate({
      initiatorId: user!.id,
      receiverId: selectedSkill.userId,
      wantSkillId: selectedSkill.id,
      offerSkillId: parseInt(myOfferSkillId),
    }, {
      onSuccess: () => {
        setSelectedSkill(null);
        setMyOfferSkillId("");
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
            />
          </div>
          <Select 
            value={filterType} 
            onValueChange={(v: "OFFERED" | "WANTED") => setFilterType(v)}
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

      {isLoading ? (
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
      <Dialog open={!!selectedSkill} onOpenChange={(open) => !open && setSelectedSkill(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Swap</DialogTitle>
            <DialogDescription>
              You want to learn <strong>{selectedSkill?.name}</strong> from {selectedSkill?.user?.name}.
              What skill will you teach in return?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Select a skill you offer</Label>
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
                  You haven't added any skills to offer yet. Go to "My Skills" to add one first.
                </p>
              )}
            </div>

            <Button 
              className="w-full" 
              onClick={handleRequestSwap}
              disabled={createSwap.isPending || !myOfferSkillId}
            >
              {createSwap.isPending ? "Sending Request..." : "Send Request"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
