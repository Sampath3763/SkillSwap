import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap } from "lucide-react";

export default function AuthPage() {
  const { user, login, register, isLoggingIn, isRegistering } = useAuth();
  
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ 
    username: "", password: "", name: "", location: "", availability: "both", bio: "" 
  });

  if (user) return <Redirect to="/" />;

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
                <Zap size={20} />
              </div>
              <span className="text-2xl font-display font-bold">SkillSwap</span>
            </div>
            <h1 className="text-4xl font-display font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground mt-2">Trade skills, learn new things, meet people.</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={(e) => { e.preventDefault(); login(loginData); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={loginData.username} 
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={loginData.password} 
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={(e) => { e.preventDefault(); register(registerData); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input 
                      value={registerData.username} 
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input 
                      value={registerData.name} 
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input 
                    type="password"
                    value={registerData.password} 
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input 
                    placeholder="City, Country"
                    value={registerData.location} 
                    onChange={(e) => setRegisterData({ ...registerData, location: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Input 
                    placeholder="Tell us about your expertise..."
                    value={registerData.bio} 
                    onChange={(e) => setRegisterData({ ...registerData, bio: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isRegistering}>
                  {isRegistering ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex flex-col justify-center p-12 bg-muted relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
        <div className="relative z-10 max-w-lg mx-auto text-center space-y-6">
          {/* Unsplash abstract image for visual interest */}
          <div className="rounded-2xl overflow-hidden shadow-2xl mb-8 rotate-3 transition-transform hover:rotate-0 duration-500">
            {/* collaboration hands working together */}
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
              alt="Collaboration" 
              className="w-full h-auto object-cover"
            />
          </div>
          <h2 className="text-3xl font-bold font-display">Exchange skills, grow together.</h2>
          <p className="text-muted-foreground text-lg">
            Connect with experts in coding, languages, music, and more. 
            Teach what you know, learn what you don't.
          </p>
        </div>
      </div>
    </div>
  );
}
