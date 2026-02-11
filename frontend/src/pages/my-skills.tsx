import { useAuth } from "@/hooks/use-auth";
import { useSkills, useDeleteSkill } from "@/hooks/use-skills";
import { CreateSkillDialog } from "@/components/create-skill-dialog";
import { SkillCard } from "@/components/skill-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MySkills() {
  const { user } = useAuth();
  const { data: skills, isLoading } = useSkills({ userId: user?.id });
  const deleteSkill = useDeleteSkill();

  const offeredSkills = skills?.filter(s => s.type === "OFFERED") || [];
  const wantedSkills = skills?.filter(s => s.type === "WANTED") || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">My Skills</h1>
          <p className="text-muted-foreground">Manage the skills you offer and what you want to learn.</p>
        </div>
        <CreateSkillDialog />
      </div>

      <Tabs defaultValue="offered" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="offered">Offered ({offeredSkills.length})</TabsTrigger>
          <TabsTrigger value="wanted">Wanted ({wantedSkills.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="offered">
          {isLoading ? (
            <div className="text-muted-foreground">Loading skills...</div>
          ) : offeredSkills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offeredSkills.map(skill => (
                <SkillCard 
                  key={skill.id} 
                  skill={{ ...skill, user: user! }} 
                  isOwner
                  onDelete={() => deleteSkill.mutate(skill.id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-muted/30 rounded-xl p-12 text-center border border-dashed border-border">
              <p className="text-muted-foreground mb-4">You haven't added any skills you can teach yet.</p>
              <CreateSkillDialog />
            </div>
          )}
        </TabsContent>

        <TabsContent value="wanted">
          {isLoading ? (
            <div className="text-muted-foreground">Loading skills...</div>
          ) : wantedSkills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wantedSkills.map(skill => (
                <SkillCard 
                  key={skill.id} 
                  skill={{ ...skill, user: user! }} 
                  isOwner
                  onDelete={() => deleteSkill.mutate(skill.id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-muted/30 rounded-xl p-12 text-center border border-dashed border-border">
              <p className="text-muted-foreground mb-4">You haven't added any skills you want to learn yet.</p>
              <CreateSkillDialog />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
