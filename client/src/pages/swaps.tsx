import { useAuth } from "@/hooks/use-auth";
import { useSwaps, useUpdateSwapStatus } from "@/hooks/use-swaps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Video, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Swaps() {
  const { user } = useAuth();
  const { data: swaps, isLoading } = useSwaps();
  const updateStatus = useUpdateSwapStatus();

  if (isLoading) return <div className="p-8">Loading swaps...</div>;

  const incomingRequests = swaps?.filter(s => s.receiverId === user?.id && s.status === 'pending') || [];
  const myRequests = swaps?.filter(s => s.initiatorId === user?.id && s.status === 'pending') || [];
  const activeHistory = swaps?.filter(s => s.status !== 'pending') || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Swaps</h1>
        <p className="text-muted-foreground">Manage your skill exchange requests.</p>
      </div>

      {/* Incoming Requests Section */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          Incoming Requests
          {incomingRequests.length > 0 && <Badge>{incomingRequests.length}</Badge>}
        </h2>
        {incomingRequests.length > 0 ? (
          <div className="grid gap-4">
            {incomingRequests.map(swap => (
              <Card key={swap.id} className="border-l-4 border-l-secondary">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg">{swap.initiator.name} wants to learn {swap.wantSkill.name}</h3>
                    <p className="text-muted-foreground">
                      Offering in return: <span className="text-primary font-medium">{swap.offerSkill.name}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => updateStatus.mutate({ id: swap.id, status: 'rejected' })}
                      className="text-destructive hover:bg-destructive/10 border-destructive/20"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button 
                      onClick={() => updateStatus.mutate({ id: swap.id, status: 'accepted' })}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Accept Swap
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-sm italic">No pending incoming requests.</div>
        )}
      </section>

      {/* Outgoing Requests */}
      <section>
        <h2 className="text-xl font-bold mb-4">Sent Requests</h2>
        {myRequests.length > 0 ? (
          <div className="grid gap-4">
            {myRequests.map(swap => (
              <Card key={swap.id} className="bg-muted/30">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Request to learn {swap.wantSkill.name} from {swap.receiver.name}</p>
                    <p className="text-xs text-muted-foreground">Sent on {format(new Date(swap.createdAt || ""), "MMM d, yyyy")}</p>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-sm italic">No pending sent requests.</div>
        )}
      </section>

      {/* Active & History */}
      <section>
        <h2 className="text-xl font-bold mb-4">Active & History</h2>
        <div className="grid gap-4">
          {activeHistory.map(swap => {
            const isMeInitiator = swap.initiatorId === user?.id;
            const otherUser = isMeInitiator ? swap.receiver : swap.initiator;
            
            return (
              <Card key={swap.id} className={swap.status === 'accepted' ? 'border-primary' : ''}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={swap.status === 'accepted' ? 'default' : 'secondary'}>
                          {swap.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(swap.createdAt || ""), "MMM d, yyyy")}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg">Swap with {otherUser.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {swap.offerSkill.name} ↔ {swap.wantSkill.name}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {swap.status === 'accepted' && (
                        <>
                          <Button 
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => window.open(`https://meet.jit.si/SkillSwap-${swap.id}`, '_blank')}
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Join Call
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => updateStatus.mutate({ id: swap.id, status: 'completed' })}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Complete
                          </Button>
                        </>
                      )}
                      {swap.status === 'completed' && (
                        <ReviewDialog swapId={swap.id} otherUserName={otherUser.name} />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {activeHistory.length === 0 && (
            <div className="text-muted-foreground text-sm italic">No history yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function ReviewDialog({ swapId, otherUserName }: { swapId: number, otherUserName: string }) {
  // Simple placeholder for review functionality for MVP
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <MessageSquare className="w-4 h-4 mr-2" />
          Leave Review
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review {otherUserName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Label>Rating</Label>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(star => (
              <Button key={star} variant="outline" size="icon" className="hover:text-yellow-500">
                ★
              </Button>
            ))}
          </div>
          <Label>Comment</Label>
          <Textarea placeholder="How was the session?" />
          <Button className="w-full">Submit Review</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
