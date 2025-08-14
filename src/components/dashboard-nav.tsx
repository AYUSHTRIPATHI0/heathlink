"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageCircle,
  ListTodo,
  History,
  User,
  HeartPulse,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";


const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/chat", label: "Chat", icon: MessageCircle },
  { href: "/dashboard/todo", label: "To-Do", icon: ListTodo },
  { href: "/dashboard/predictions", label: "Predictions", icon: HeartPulse },
  { href: "/dashboard/history", label: "History", icon: History },
];

type UserData = {
  name: string;
  profileImageUrl?: string;
};

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        }
      });
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "flex flex-col items-center h-full px-2",
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          ))}
          <Link href="/dashboard/profile">
            <Button variant="ghost" className={cn("flex flex-col items-center h-full px-2", pathname === "/dashboard/profile" ? "text-primary" : "text-muted-foreground")}>
              <User className="w-6 h-6" />
              <span className="text-xs">Profile</span>
            </Button>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 border-r bg-card p-4">
      <div className="flex items-center gap-2 font-bold text-2xl mb-8">
        <HeartPulse className="w-8 h-8 text-primary" />
        <span className="font-headline">HealthSync</span>
      </div>
      
      <nav className="flex-grow flex flex-col gap-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <div className="border-t -mx-4 my-2"></div>
         <Link href="/dashboard/profile">
            <Button variant={pathname.startsWith("/dashboard/profile") ? "secondary" : "ghost"} className="w-full justify-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={userData?.profileImageUrl} />
                <AvatarFallback>{userData?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                  <span className="font-semibold">{userData?.name || "User"}</span>
                  <span className="text-xs text-muted-foreground">View Profile</span>
              </div>
            </Button>
          </Link>
        <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
            Logout
        </Button>
      </div>
    </aside>
  );
}
