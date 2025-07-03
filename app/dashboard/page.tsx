"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [rateLimit, setRateLimit] = useState<{ used: number; max: number } | null>(null);

  useEffect(() => {
    if (session?.user?.tenantSubdomain) {
      fetch(`/api/ratelimit?tenantSubdomain=${session.user.tenantSubdomain}`)
        .then(res => res.json())
        .then(setRateLimit);
    }
  }, [session]);

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>Please log in to view your dashboard.</div>;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="mb-4">Welcome, {session.user.email}!</div>
      <div className="mb-4">Tenant: {session.user.tenantSubdomain}</div>
      {rateLimit && (
        <div className="mb-4">Rate Limit: {rateLimit.used} / {rateLimit.max} this hour</div>
      )}
      {/* Add more tenant-specific data here */}
    </main>
  );
}
