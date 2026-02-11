import { Skill, User } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Globe, MapPin, Trash2, ArrowRightLeft } from "lucide-react";

interface SkillCardProps {
  skill: Skill & { user?: User };
  isOwner?: boolean;
  onDelete?: () => void;
  onRequestSwap?: () => void;
}

export function SkillCard({ skill, isOwner, onDelete, onRequestSwap }: SkillCardProps) {
  const isOffered = skill.type === "OFFERED";
  
  return (
    <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 group">
      <CardHeader className="p-0">
        <div className={`h-2 w-full ${isOffered ? "bg-gradient-to-r from-primary to-blue-400" : "bg-gradient-to-r from-secondary to-purple-400"}`} />
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <Badge variant={isOffered ? "default" : "secondary"} className="mb-2">
            {isOffered ? "Offers" : "Wants"}
          </Badge>
          <Badge variant="outline" className="capitalize text-xs font-normal">
            {skill.level}
          </Badge>
        </div>
        
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{skill.name}</h3>
        
        {skill.user && (
          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{skill.user.username}</span>
            <span className="text-xs">•</span>
            <div className="flex items-center gap-1">
              <MapPin size={12} />
              {skill.user.location}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
          {skill.mode === "online" ? <Globe size={14} /> : <MapPin size={14} />}
          <span className="capitalize">{skill.mode}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0 flex justify-end">
        {isOwner ? (
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Skill
          </Button>
        ) : (
          onRequestSwap && (
            <Button 
              size="sm" 
              className="w-full bg-secondary hover:bg-secondary/90 text-white"
              onClick={onRequestSwap}
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Request Swap
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
}
