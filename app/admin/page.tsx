"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import SessionProviderWrapper from "../../components/SessionProviderWrapper";

export default function AdminPanel() {
  return (
    <SessionProviderWrapper>
      <AdminPanelContent />
    </SessionProviderWrapper>
  );
}

function AdminPanelContent() {
  const { data: session } = useSession() || {};
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [loadingApiKeys, setLoadingApiKeys] = useState(false);

  useEffect(() => {
    if (session?.user?.role !== "admin") return;
    setLoadingTenants(true);
    fetch("/api/tenant-list")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch tenants");
        return res.json();
      })
      .then(data => setTenants(data.tenants || []))
      .catch(() => setError("Failed to fetch tenants"))
      .finally(() => setLoadingTenants(false));
  }, [session]);

  const handleSelectTenant = async (tenant: any) => {
    setSelectedTenant(tenant);
    setLoadingApiKeys(true);
    setError("");
    try {
      const res = await fetch(`/api/apikey-list?tenantId=${tenant.id}`);
      if (!res.ok) throw new Error("Failed to fetch API keys");
      const data = await res.json();
      setApiKeys(data.apiKeys || []);
    } catch {
      setError("Failed to fetch API keys");
      setApiKeys([]);
    } finally {
      setLoadingApiKeys(false);
    }
  };

  const handleApiKeyAction = async (apiKeyId: string, action: "revoke" | "regenerate") => {
    const res = await fetch("/api/apikey", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKeyId, action })
    });
    if (!res.ok) {
      setError("Failed to update API key");
      return;
    }
    // Refresh API keys
    if (selectedTenant) handleSelectTenant(selectedTenant);
  };

  if (!session || session.user.role !== "admin") return <div>Admin access required.</div>;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <div className="flex">
        <div className="w-1/3">
          <h2 className="font-bold mb-2">Tenants</h2>
          {loadingTenants ? (
            <div>Loading tenants...</div>
          ) : tenants.length === 0 ? (
            <div>No tenants found.</div>
          ) : (
            <ul>
              {tenants.map(t => (
                <li key={t.id} className="mb-2">
                  <button className="btn" onClick={() => handleSelectTenant(t)}>{t.name} ({t.subdomain})</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="w-2/3 pl-8">
          {selectedTenant && (
            <>
              <h2 className="font-bold mb-2">Tenant Details</h2>
              <div>Name: {selectedTenant.name ?? "-"}</div>
              <div>Subdomain: {selectedTenant.subdomain ?? "-"}</div>
              <div>Contact: {selectedTenant.contactEmail ?? "-"}</div>
              <h3 className="font-bold mt-4 mb-2">API Keys</h3>
              {loadingApiKeys ? (
                <div>Loading API keys...</div>
              ) : apiKeys.length === 0 ? (
                <div>No API keys found.</div>
              ) : (
                <ul>
                  {apiKeys.map(k => (
                    <li key={k.id} className="mb-2">
                      {k.status} - {k.createdAt ? new Date(k.createdAt).toLocaleString() : "-"}
                      <button className="btn ml-2" onClick={() => handleApiKeyAction(k.id, "revoke")}>Revoke</button>
                      <button className="btn ml-2" onClick={() => handleApiKeyAction(k.id, "regenerate")}>Regenerate</button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </main>
  );
}
