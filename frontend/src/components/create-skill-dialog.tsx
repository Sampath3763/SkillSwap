import { useState } from "react";
import { useCreateSkill } from "@/hooks/use-skills";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export function CreateSkillDialog() {
  const [open, setOpen] = useState(false);
  const createSkill = useCreateSkill();
  
  const [formData, setFormData] = useState({
    name: "",
    type: "OFFERED" as "OFFERED" | "WANTED",
    level: "beginner",
    mode: "online"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSkill.mutate(formData, {
      onSuccess: () => {
        setOpen(false);
        setFormData({ name: "", type: "OFFERED", level: "beginner", mode: "online" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Add Skill
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Skill</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Skill Name</Label>
            <Input 
              placeholder="e.g. React Development, Piano, Spanish" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(v: "OFFERED" | "WANTED") => setFormData({ ...formData, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OFFERED">I Offer This</SelectItem>
                  <SelectItem value="WANTED">I Want This</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Level</Label>
              <Select 
                value={formData.level} 
                onValueChange={(v) => setFormData({ ...formData, level: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mode</Label>
            <Select 
              value={formData.mode} 
              onValueChange={(v) => setFormData({ ...formData, mode: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline / In-person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={createSkill.isPending}>
            {createSkill.isPending ? "Adding..." : "Add Skill"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
