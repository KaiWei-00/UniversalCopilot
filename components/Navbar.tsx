import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  return (
    <nav className="bg-white shadow px-4 py-2 flex justify-between items-center">
      <div className="font-bold text-lg">
        <Link href="/">Universal Copilot A</Link>
      </div>
      <div>
        {session?.user ? (
          <>
            <span className="mr-4">{session.user.email}</span>
            <button className="btn btn-outline" onClick={() => signOut()}>Logout</button>
          </>
        ) : (
          <Link href="/login" className="btn">Login</Link>
        )}
      </div>
    </nav>
  );
}
