"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HeartPulse,
  Footprints,
  Flame,
  MessageCircle,
  ListTodo,
  BrainCircuit,
  Pill,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const featureCards = [
  {
    href: "/dashboard/chat",
    title: "AI Chat Assistant",
    description: "Get answers and suggestions from your AI assistant.",
    icon: MessageCircle,
  },
  {
    href: "/dashboard/todo",
    title: "Daily To-Do List",
    description: "Manage your health tasks and goals for the day.",
    icon: ListTodo,
  },
  {
    href: "/dashboard/predictions",
    title: "Health Predictions",
    description: "AI insights into your future well-being.",
    icon: BrainCircuit,
  },
  {
    href: "/dashboard/predictions",
    title: "Medication & Doctors",
    description: "Get recommendations and find specialists.",
    icon: Pill,
  },
];

const chartData = [
  { day: "Mon", steps: 5500 },
  { day: "Tue", steps: 7200 },
  { day: "Wed", steps: 6800 },
  { day: "Thu", steps: 8100 },
  { day: "Fri", steps: 9500 },
  { day: "Sat", steps: 10200 },
  { day: "Sun", steps: 8800 },
];

const chartConfig = {
  steps: {
    label: "Steps",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

type UserData = {
  name: string;
  profileImageUrl?: string;
};

type HealthLog = {
    heartRate: number;
    steps: number;
    calories: number;
};

export default function DashboardPage() {
  const [user, loading] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [quickStats, setQuickStats] = useState([
    { label: "Heart Rate", value: "0", unit: "bpm", icon: HeartPulse, color: "text-red-500" },
    { label: "Steps", value: "0", unit: "today", icon: Footprints, color: "text-blue-500" },
    { label: "Calories", value: "0", unit: "kcal", icon: Flame, color: "text-orange-500" },
  ]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        }
      }
    };
  
    const fetchHealthLog = async () => {
      if (user) {
        const today = new Date().toISOString().split('T')[0];
        const healthLogRef = doc(db, "users", user.uid, "dailyHealthLogs", today);
        const docSnap = await getDoc(healthLogRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as HealthLog;
          setQuickStats([
            { label: "Heart Rate", value: data.heartRate.toString(), unit: "bpm", icon: HeartPulse, color: "text-red-500" },
            { label: "Steps", value: data.steps.toLocaleString(), unit: "today", icon: Footprints, color: "text-blue-500" },
            { label: "Calories", value: data.calories.toLocaleString(), unit: "kcal", icon: Flame, color: "text-orange-500" },
          ]);
        }
      }
    };
  
    fetchUserData();
    fetchHealthLog();
  }, [user]);

  if(loading) {
      return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <Skeleton className="h-9 w-40 mb-2"/>
                    <Skeleton className="h-5 w-60"/>
                </div>
                <Skeleton className="h-12 w-12 rounded-full"/>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-28"/>
                <Skeleton className="h-28"/>
                <Skeleton className="h-28"/>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3"><Skeleton className="h-80"/></div>
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                   <Skeleton className="h-40"/>
                   <Skeleton className="h-40"/>
                </div>
            </div>
        </div>
      )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Hi, {userData?.name || 'User'} 👋</h1>
          <p className="text-muted-foreground">
            Here's your health summary for today.
          </p>
        </div>
        <Link href="/dashboard/profile">
          <Avatar className="h-12 w-12 cursor-pointer ring-2 ring-offset-2 ring-offset-background ring-transparent transition-all hover:ring-primary">
            <AvatarImage src={userData?.profileImageUrl} alt={userData?.name} />
            <AvatarFallback>{userData?.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.unit}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
            <Card className="shadow-md hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <TrendingUp /> Weekly Activity
                    </CardTitle>
                    <CardDescription>
                        Your step count over the last 7 days.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                     <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <AreaChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12, top: 10, bottom: 0, }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                            <Area dataKey="steps" type="natural" fill="var(--color-steps)" fillOpacity={0.4} stroke="var(--color-steps)" stackId="a" />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
             {featureCards.slice(0,2).map((feature) => (
            <Link key={feature.title} href={feature.href} className="group">
              <Card className="hover:shadow-lg transition-shadow h-full flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-start gap-4">
                     <div className="bg-primary/10 p-3 rounded-lg">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="font-headline text-lg">{feature.title}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">{feature.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardFooter>
                    <div className="flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                      Go to page <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      
       <div>
        <h2 className="text-2xl font-bold font-headline mb-4">Explore More</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {featureCards.slice(2).map((feature) => (
            <Link key={feature.title} href={feature.href} className="group">
              <Card className="hover:shadow-lg transition-shadow h-full flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="font-headline text-lg">{feature.title}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">{feature.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardFooter>
                    <div className="flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                      Go to page <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
