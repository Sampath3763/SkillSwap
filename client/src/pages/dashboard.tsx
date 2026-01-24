import { useAuth } from "@/hooks/use-auth";
import { useSwaps } from "@/hooks/use-swaps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: swaps, isLoading } = useSwaps();

  if (isLoading) return <div className="p-8">Loading dashboard...</div>;

  const activeSwaps = swaps?.filter(s => s.status === 'accepted') || [];
  const pendingSwaps = swaps?.filter(s => s.status === 'pending') || [];
  const completedSwaps = swaps?.filter(s => s.status === 'completed') || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user?.name}. Here's what's happening.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user?.credits}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-secondary shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Swaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeSwaps.length}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sessions Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedSwaps.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Video className="w-5 h-5 text-primary" />
          Upcoming Sessions
        </h2>
        
        {activeSwaps.length === 0 ? (
          <div className="bg-muted/30 rounded-xl p-8 text-center border border-dashed border-border">
            <p className="text-muted-foreground">No active sessions. Go to Explore to find a match!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeSwaps.map((swap) => (
              <Card key={swap.id} className="flex flex-col md:flex-row items-center justify-between p-6 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>{swap.offerSkill.name}</Badge>
                    <span className="text-muted-foreground text-sm">↔</span>
                    <Badge variant="secondary">{swap.wantSkill.name}</Badge>
                  </div>
                  <p className="font-medium">
                    Swap with {swap.initiatorId === user?.id ? swap.receiver.name : swap.initiator.name}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar size={14} /> Today</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> 1 hour</span>
                  </div>
                </div>
                <Button 
                  className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
                  onClick={() => window.open(`https://meet.jit.si/SkillSwap-${swap.id}`, '_blank')}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Join Meeting
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Pending Requests */}
      {pendingSwaps.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Pending Requests</h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {pendingSwaps.map((swap) => {
              const isIncoming = swap.receiverId === user?.id;
              return (
                <div key={swap.id} className="p-4 border-b last:border-0 hover:bg-muted/30 transition-colors flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {isIncoming 
                        ? `${swap.initiator.name} wants to learn ${swap.wantSkill.name}` 
                        : `You requested to learn ${swap.wantSkill.name} from ${swap.receiver.name}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Offer: {swap.offerSkill.name} • Status: <span className="text-yellow-600 font-medium capitalize">{swap.status}</span>
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(swap.createdAt || new Date()), "MMM d, yyyy")}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
