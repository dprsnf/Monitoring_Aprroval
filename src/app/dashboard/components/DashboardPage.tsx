"use client";

import { useEffect, useState } from "react";
import Header from "@/components/common/Header";
import DashboardGrid from "@/components/dashboard/DashboardGrid";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const { user, isLoading: authLoading, logout } = useAuth();
//   const [stats, setStats] = useState<any>(null);
//   const [statsLoading, setStatsLoading] = useState(true);
  const [gridLoading, setGridLoading] = useState(true);

  const handleLogout = () => logout();

  // Simulasi fetch stats (ganti dengan API kamu)
//   useEffect(() => {
//     if (!user) return;

//     const fetchStats = async () => {
//       try {
//         setStatsLoading(true);
//         // Ganti dengan API kamu
//         // const { data } = await api.get("/dashboard/stats");
//         // setStats(data);
//         const mockStats = {
//           totalSubmissions: 42,
//           inProgress: 18,
//           onHold: 5,
//           approved: 19,
//         };
//         setStats(mockStats);
//       } catch (error) {
//         console.error("Gagal load stats:", error);
//       } finally {
//         setStatsLoading(false);
//       }
//     };

//     fetchStats();
//   }, [user]);

  // Simulasi loading grid (karena DashboardGrid butuh user)
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => setGridLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Jika auth masih loading
  if (authLoading) {
    return <AuthSkeleton />;
  }

  // Jika tidak ada user
  if (!user) {
    return <div className="min-h-screen bg-[#14a2ba] flex items-center justify-center">
      <p className="text-white text-xl">Memuat...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#14a2ba]">
      <Header
        title="PLN UPT MANADO"
        currentUser={user}
        showLogo
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Welcome Section */}
        <WelcomeSection />

        {/* Dashboard Grid - Skeleton */}
        {gridLoading ? <DashboardGridSkeleton /> : <DashboardGrid />}

        {/* Quick Stats - Skeleton */}
        {/* {statsLoading ? <StatsSkeleton /> : <DashboardStats stats={stats} />} */}
      </main>
    </div>
  );
}


function AuthSkeleton() {
  return (
    <div className="min-h-screen bg-[#14a2ba]">
      <div className="h-16 bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <Skeleton className="h-8 w-48 bg-white/30" />
          <Skeleton className="h-10 w-10 rounded-full bg-white/30" />
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-32 w-full rounded-xl bg-white/20 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl bg-white/20" />
          ))}
        </div>
      </main>
    </div>
  );
}

function WelcomeSection() {
  return (
    <div className="mb-6 sm:mb-8 text-center p-4 sm:p-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30">
      <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">
        Dashboard Approval PLN
      </h2>
      <p className="text-gray-700 text-sm sm:text-lg">
        PT PLN (Persero) UPT Manado - Sistem Monitoring & Approval Drawing
      </p>
    </div>
  );
}

function DashboardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="overflow-hidden bg-white/95 backdrop-blur border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg bg-gray-200" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32 bg-gray-200" />
                <Skeleton className="h-4 w-24 bg-gray-200" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// function StatsSkeleton() {
//   return (
//     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
//       {[...Array(4)].map((_, i) => (
//         <Card key={i} className="bg-white/95 backdrop-blur border-0 shadow-md">
//           <CardContent className="p-4 sm:p-6 text-center">
//             <Skeleton className="h-8 w-16 mx-auto mb-2 bg-gray-200" />
//             <Skeleton className="h-4 w-20 mx-auto bg-gray-200" />
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   );
// }