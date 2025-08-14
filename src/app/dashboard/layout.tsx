"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardNav } from "@/components/dashboard-nav";
import type { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";

// This metadata will not be applied on the server because this is a client component,
// but we keep it here for reference. We would need to handle metadata differently
// in a real-world scenario for client-rendered routes.
// export const metadata: Metadata = {
//   title: "Dashboard - HealthSync",
//   description: "Your personal health dashboard.",
// };

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-secondary">
        <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 border-r bg-card p-4">
          <div className="flex items-center gap-2 font-bold text-2xl mb-8">
             <Skeleton className="w-8 h-8 rounded-full" />
             <Skeleton className="h-7 w-32" />
          </div>
          <nav className="flex-grow flex flex-col gap-2">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="w-5 h-5 rounded-sm" />
                    <Skeleton className="h-5 w-24" />
                </div>
            ))}
          </nav>
           <div className="mt-auto flex flex-col gap-4">
              <div className="border-t -mx-4 my-2"></div>
              <div className="flex items-center gap-3 p-2">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex items-center gap-3 p-2">
                  <Skeleton className="w-5 h-5 rounded-sm" />
                  <Skeleton className="h-5 w-16" />
              </div>
           </div>
        </aside>
        <main className="md:pl-64">
          <div className="p-4 sm:p-6 lg:p-8">
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
                  <Skeleton className="h-80 w-full"/>
              </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <DashboardNav />
      <main className="md:pl-64 pb-20 md:pb-0">
        <div className="p-4 sm:p-6 lg:p-8">
            {children}
        </div>
      </main>
    </div>
  );
}
