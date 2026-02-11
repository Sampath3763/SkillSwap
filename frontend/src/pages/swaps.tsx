import { useAuth } from "@/hooks/use-auth";
import { useSwaps, useUpdateSwapStatus } from "@/hooks/use-swaps";
import { useCreateReview } from "@/hooks/use-reviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Video, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function Swaps() {
  const { user } = useAuth();
  const { data: swaps, isLoading } = useSwaps();
  const updateStatus = useUpdateSwapStatus();

  if (isLoading) return <div className="p-8">Loading swaps...</div>;

  const incomingRequests = swaps?.filter(s => s.receiverId === user?.id && s.status === 'pending') || [];
  const myRequests = swaps?.filter(s => s.initiatorId === user?.id && s.status === 'pending') || [];
  const activeSwaps = swaps?.filter(s => s.status === 'accepted') || [];
  const completedSwaps = swaps?.filter(s => s.status === 'completed') || [];
  const rejectedSwaps = swaps?.filter(s => s.status === 'rejected') || [];

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
            {incomingRequests.map(swap => {
              if (!swap.initiator || !swap.wantSkill) return null;
              const isCommunityRequest = !(swap as any).offerSkillId || (swap as any).offerSkillId === 0;
              return (
                <Card key={swap.id} className={`border-l-4 ${isCommunityRequest ? 'border-l-blue-500' : 'border-l-secondary'}`}>
                  <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      {isCommunityRequest && (
                        <Badge className="mb-2 bg-blue-500">Community Request</Badge>
                      )}
                      <h3 className="font-bold text-lg">{swap.initiator?.name} wants to learn {swap.wantSkill?.name}</h3>
                      <p className="text-muted-foreground">
                        {isCommunityRequest ? (
                          <span className="italic">Asking for mentorship - no skill exchange required</span>
                        ) : (
                          <>Offering in return: <span className="text-primary font-medium">{swap.offerSkill?.name}</span></>
                        )}
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
              );
            })}
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
            {myRequests.map(swap => {
              if (!swap.wantSkill || !swap.receiver) return null;
              return (
                <Card key={swap.id} className="bg-muted/30">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">Request to learn {swap.wantSkill?.name} from {swap.receiver?.name}</p>
                      <p className="text-xs text-muted-foreground">Sent on {format(new Date(swap.createdAt || ""), "MMM d, yyyy")}</p>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-muted-foreground text-sm italic">No pending sent requests.</div>
        )}
      </section>

      {/* Active Swaps */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          Active Sessions
          {activeSwaps.length > 0 && <Badge className="bg-green-600">{activeSwaps.length}</Badge>}
        </h2>
        <div className="grid gap-4">
          {activeSwaps.map(swap => {
            if (!swap.initiator || !swap.receiver || !swap.wantSkill) return null;
            const isMeInitiator = swap.initiatorId === user?.id;
            const otherUser = isMeInitiator ? swap.receiver : swap.initiator;
            const isCommunityRequest = !(swap as any).offerSkillId || (swap as any).offerSkillId === 0;
            
            return (
              <Card key={swap.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-green-600">ACTIVE</Badge>
                        {isCommunityRequest && <Badge className="bg-blue-500">Community</Badge>}
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(swap.createdAt || ""), "MMM d, yyyy")}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg">
                        {isCommunityRequest 
                          ? `${isMeInitiator ? 'Mentorship' : 'Mentoring'} with ${otherUser?.name}`
                          : `Swap with ${otherUser?.name}`
                        }
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isCommunityRequest 
                          ? `Learning ${swap.wantSkill?.name}`
                          : `${swap.offerSkill?.name} ↔ ${swap.wantSkill?.name}`
                        }
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => window.open(swap.meetingUrl || `https://meet.jit.si/SkillSwap-${swap.id}`, '_blank')}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Meeting
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {activeSwaps.length === 0 && (
            <div className="text-muted-foreground text-sm italic">No active sessions.</div>
          )}
        </div>
      </section>

      {/* Session History */}
      <section>
        <h2 className="text-xl font-bold mb-4">Session History</h2>
        <div className="grid gap-4">
          {completedSwaps.map(swap => {
            if (!swap.initiator || !swap.receiver || !swap.wantSkill) return null;
            const isMeInitiator = swap.initiatorId === user?.id;
            const otherUser = isMeInitiator ? swap.receiver : swap.initiator;
            const isCommunityRequest = !(swap as any).offerSkillId || (swap as any).offerSkillId === 0;
            
            return (
              <Card key={swap.id} className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                          ✓ COMPLETED
                        </Badge>
                        {isCommunityRequest && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Community</Badge>}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(swap.createdAt || ""), "MMM d, yyyy")}
                        </span>
                      </div>
                      <h3 className="font-medium">
                        {isCommunityRequest 
                          ? `${isMeInitiator ? 'Mentorship' : 'Mentoring'} with ${otherUser?.name}`
                          : `Swap with ${otherUser?.name}`
                        }
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isCommunityRequest 
                          ? `Learned ${swap.wantSkill?.name}`
                          : `${swap.offerSkill?.name} ↔ ${swap.wantSkill?.name}`
                        }
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <ReviewDialog swapId={swap.id} otherUserId={otherUser.id} otherUserName={otherUser.name} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {completedSwaps.length === 0 && (
            <div className="text-muted-foreground text-sm italic">No completed sessions yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function ReviewDialog({ swapId, otherUserId, otherUserName }: { swapId: number; otherUserId: number; otherUserName: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [open, setOpen] = useState(false);
  const createReview = useCreateReview();
  const { user } = useAuth();

  const handleSubmit = () => {
    if (!user) return;
    createReview.mutate({
      swapId,
      revieweeId: otherUserId,
      rating,
      comment,
    }, {
      onSuccess: () => {
        setOpen(false);
        setRating(5);
        setComment("");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <div>
            <Label>Rating</Label>
            <div className="flex gap-2 mt-2">
              {[1,2,3,4,5].map(star => (
                <Button 
                  key={star} 
                  variant="outline" 
                  size="icon" 
                  className={rating >= star ? "text-yellow-500 bg-yellow-50 border-yellow-300" : ""}
                  onClick={() => setRating(star)}
                >
                  ★
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label>Comment (Optional)</Label>
            <Textarea 
              placeholder="How was the session?" 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-2"
            />
          </div>
          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={createReview.isPending}
          >
            {createReview.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
