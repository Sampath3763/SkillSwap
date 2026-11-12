import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { SignIn, SignUp } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, ShieldCheck } from "lucide-react";

export default function AuthPage() {
  const { user, isSignedIn, login, isLoggingIn } = useAuth();
  const [authMode, setAuthMode] = useState<"clerk-signin" | "clerk-signup" | "demo">("clerk-signin");
  const [demoUsername, setDemoUsername] = useState("sam");
  const [demoPassword, setDemoPassword] = useState("123456789");

  if (user || isSignedIn) return <Redirect to="/" />;

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Auth Form */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-background overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
                <Zap size={20} />
              </div>
              <span className="text-2xl font-display font-bold">SkillSwap</span>
            </div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Welcome to SkillSwap</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Trade skills, learn from peers, and connect with mentors without money.
            </p>
          </div>

          <Tabs
            value={authMode}
            onValueChange={(val) => setAuthMode(val as any)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="clerk-signin">Sign In</TabsTrigger>
              <TabsTrigger value="clerk-signup">Sign Up</TabsTrigger>
              <TabsTrigger value="demo">Demo Login</TabsTrigger>
            </TabsList>

            <TabsContent value="clerk-signin" className="flex justify-center">
              <SignIn
                routing="virtual"
                signUpUrl="/auth"
                fallbackRedirectUrl="/"
              />
            </TabsContent>

            <TabsContent value="clerk-signup" className="flex justify-center">
              <SignUp
                routing="virtual"
                signInUrl="/auth"
                fallbackRedirectUrl="/"
              />
            </TabsContent>

            <TabsContent value="demo">
              <div className="rounded-xl border border-border p-5 bg-card space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Existing Atlas Demo Accounts</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Select a test account or enter your credentials:
                </p>

                <div className="flex flex-wrap gap-2">
                  {[
                    { u: "sam", role: "Web Dev" },
                    { u: "Jane", role: "QA Engineer" },
                    { u: "arjun", role: "Machine Learning" },
                    { u: "arvind", role: "Data Analyst" },
                  ].map((demo) => (
                    <Button
                      key={demo.u}
                      type="button"
                      variant={demoUsername === demo.u ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setDemoUsername(demo.u);
                        setDemoPassword("123456789");
                      }}
                      className="text-xs"
                    >
                      {demo.u} ({demo.role})
                    </Button>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    login({ username: demoUsername, password: demoPassword });
                  }}
                  className="space-y-3 pt-2"
                >
                  <div className="space-y-1">
                    <Label htmlFor="demo-username" className="text-xs">Username</Label>
                    <Input
                      id="demo-username"
                      value={demoUsername}
                      onChange={(e) => setDemoUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="demo-password" className="text-xs">Password</Label>
                    <Input
                      id="demo-password"
                      type="password"
                      value={demoPassword}
                      onChange={(e) => setDemoPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full mt-2" disabled={isLoggingIn}>
                    {isLoggingIn ? "Logging in..." : `Sign in as ${demoUsername}`}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex flex-col justify-center p-12 bg-muted relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
        <div className="relative z-10 max-w-lg mx-auto text-center space-y-6">
          <div className="rounded-2xl overflow-hidden shadow-2xl mb-8 rotate-2 transition-transform hover:rotate-0 duration-500">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
              alt="SkillSwap Collaboration"
              className="w-full h-auto object-cover"
            />
          </div>
          <h2 className="text-3xl font-bold font-display">Exchange skills, grow together.</h2>
          <p className="text-muted-foreground text-lg">
            Connect with experts in coding, languages, design, and more.
            Teach what you know, learn what you don't.
          </p>
        </div>
      </div>
    </div>
  );
}
