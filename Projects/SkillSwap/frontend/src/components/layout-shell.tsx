import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useSwaps } from "@/hooks/use-swaps";
import { UserButton, Show } from "@clerk/react";
import { 
  LayoutDashboard, 
  Search, 
  BookOpen, 
  ArrowLeftRight, 
  User, 
  LogOut,
  Moon,
  Sun
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LayoutShellProps {
  children: React.ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { data: swaps } = useSwaps();

  const pendingRequestsCount = swaps?.filter(
    (s) => s.receiverId === user?.id && s.status === 'pending'
  ).length || 0;

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Explore', href: '/explore', icon: Search },
    { name: 'My Skills', href: '/my-skills', icon: BookOpen },
    { name: 'Swaps', href: '/swaps', icon: ArrowLeftRight, badge: pendingRequestsCount },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card border-r border-border px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center gap-2 mt-4">
            <img src="/logo.png" alt="SkillSwap" className="h-10 w-10 object-contain" />
            <span className="text-xl font-display font-bold text-foreground tracking-tight">SkillSwap</span>
          </div>
          
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <li key={item.name}>
                        <Link 
                          href={item.href}
                          className={cn(
                            isActive 
                              ? "bg-primary/10 text-primary" 
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                            "group flex items-center justify-between rounded-md p-2 text-sm font-semibold leading-6 transition-colors duration-200"
                          )}
                        >
                          <div className="flex items-center gap-x-3">
                            <item.icon className={cn(
                              isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                              "h-5 w-5 shrink-0"
                            )} aria-hidden="true" />
                            {item.name}
                          </div>
                          {item.badge && item.badge > 0 ? (
                            <span className="flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white shadow-sm animate-pulse">
                              {item.badge}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              
              <li className="mt-auto">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start mb-2 text-muted-foreground hover:text-foreground"
                  onClick={toggleTheme}
                >
                  {theme === "dark" ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </Button>
                
                <div className="rounded-xl bg-muted/50 p-4 mb-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <Show when="signed-in">
                        <UserButton />
                      </Show>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-foreground truncate">{user?.username || "Member"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.name || user?.location}</p>
                      </div>
                    </div>
                    {user?.credits !== undefined && (
                      <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {user.credits} cr
                      </span>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 -ml-2 text-xs"
                    onClick={() => logout()}
                  >
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    Sign out
                  </Button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top bar for mobile with theme toggle and user button */}
        <div className="lg:hidden sticky top-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="SkillSwap" className="h-8 w-8 object-contain" />
            <span className="text-lg font-display font-bold text-foreground">SkillSwap</span>
          </div>
          <div className="flex items-center gap-2">
            <Show when="signed-in">
              <UserButton />
            </Show>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
        
        <main className="py-8 px-4 sm:px-6 lg:px-8 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Nav - simplified for MVP */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 px-4 py-2">
        <div className="flex justify-around items-center">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className="relative p-2 text-muted-foreground hover:text-primary">
              <item.icon className="h-6 w-6" />
              {item.badge && item.badge > 0 ? (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
