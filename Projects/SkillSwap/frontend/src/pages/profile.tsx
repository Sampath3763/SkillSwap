import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, CircleUser, Star } from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary to-secondary"></div>
        <CardContent className="relative pt-0 px-8 pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-6 gap-6">
            <div className="h-32 w-32 rounded-full border-4 border-background bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground overflow-hidden">
              <CircleUser className="w-full h-full text-muted-foreground/50" />
            </div>
            <div className="flex-1 mb-2">
              <h1 className="text-3xl font-bold font-display">{user.name}</h1>
              <p className="text-muted-foreground text-lg">@{user.username}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                <span className="font-semibold">{user.rating || 5}</span>
                <span className="text-muted-foreground text-sm">/5</span>
              </div>
            </div>
            <Badge variant={user.availability === 'online' ? 'default' : 'secondary'} className="mb-4 text-base px-4 py-1 capitalize">
              {user.availability}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-2">About</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {user.bio || "No bio provided yet."}
                </p>
              </div>
              
              <div className="flex gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  {user.location}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  Joined {format(new Date(user.createdAt || ""), "MMMM yyyy")}
                </div>
              </div>
            </div>

            <div className="space-y-4">
               <Card className="bg-muted/20 border-0 shadow-none">
                 <CardHeader className="pb-2">
                   <CardTitle className="text-sm font-medium">Reputation</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="flex items-baseline gap-2">
                     <span className="text-3xl font-bold">5.0</span>
                     <span className="text-muted-foreground">/ 5</span>
                   </div>
                   <div className="flex text-yellow-400 mt-1">★★★★★</div>
                   <p className="text-xs text-muted-foreground mt-2">Based on user reviews</p>
                 </CardContent>
               </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
