"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function UserAccountNav() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-3 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
      >
        <div className="relative h-8 w-8 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
          {session.user.image ? (
            <Image src={session.user.image} alt={session.user.name || "User"} fill className="object-cover" />
          ) : (
            <User size={16} className="text-slate-500" />
          )}
        </div>
        <span className="text-sm font-medium text-slate-700 hidden sm:block">
          {session.user.name?.split(" ")[0] || "User"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-100 bg-white shadow-lg py-2 z-50 animate-fade-in-up">
          <div className="px-4 py-2 border-b border-slate-100 mb-2">
            <p className="text-sm font-semibold text-slate-800 truncate">{session.user.name}</p>
            <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}