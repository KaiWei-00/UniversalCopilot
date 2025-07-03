"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    subdomain: "",
    contactEmail: "",
    rateLimitTier: "free",
    maxRequestsPerHour: 1000,
    adminEmail: "",
    adminPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const res = await fetch("/api/tenant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setSuccess("Tenant registered! You can now log in.");
      setTimeout(() => router.push("/login"), 1500);
    } else {
      const data = await res.json();
      setError(data.error || "Registration failed");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <form className="bg-white p-8 rounded shadow w-96" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4">Register Tenant</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        <input name="name" placeholder="Organization Name" className="input mb-2 w-full" value={form.name} onChange={handleChange} required />
        <input name="subdomain" placeholder="Subdomain" className="input mb-2 w-full" value={form.subdomain} onChange={handleChange} required />
        <input name="contactEmail" type="email" placeholder="Contact Email" className="input mb-2 w-full" value={form.contactEmail} onChange={handleChange} required />
        <input name="adminEmail" type="email" placeholder="Admin Email" className="input mb-2 w-full" value={form.adminEmail} onChange={handleChange} required />
        <input name="adminPassword" type="password" placeholder="Admin Password" className="input mb-2 w-full" value={form.adminPassword} onChange={handleChange} required />
        <button type="submit" className="btn w-full">Register</button>
      </form>
    </main>
  );
}
