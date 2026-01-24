import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Search, 
  BookOpen, 
  ArrowLeftRight, 
  User, 
  LogOut,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LayoutShellProps {
  children: React.ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Explore', href: '/explore', icon: Search },
    { name: 'My Skills', href: '/my-skills', icon: BookOpen },
    { name: 'Swaps', href: '/swaps', icon: ArrowLeftRight },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card border-r border-border px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center gap-2 mt-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
              <Zap size={20} />
            </div>
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
                            "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-colors duration-200"
                          )}
                        >
                          <item.icon className={cn(
                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                            "h-5 w-5 shrink-0"
                          )} aria-hidden="true" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              
              <li className="mt-auto">
                <div className="rounded-xl bg-muted/50 p-4 mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.username}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Zap size={10} className="text-yellow-500 fill-yellow-500" />
                        {user.credits} Credits
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 -ml-2"
                    onClick={() => logout()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
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
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Nav - simplified for MVP */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 px-4 py-2">
        <div className="flex justify-around items-center">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className="p-2 text-muted-foreground hover:text-primary">
              <item.icon className="h-6 w-6" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
