"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenant, setTenant] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      tenant
    });
    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setError("Invalid credentials or tenant");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <form className="bg-white p-8 rounded shadow w-96" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <input type="email" placeholder="Email" className="input mb-2 w-full" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="input mb-2 w-full" value={password} onChange={e => setPassword(e.target.value)} required />
        <input type="text" placeholder="Tenant Subdomain" className="input mb-4 w-full" value={tenant} onChange={e => setTenant(e.target.value)} required />
        <button type="submit" className="btn w-full">Login</button>
      </form>
    </main>
  );
}
