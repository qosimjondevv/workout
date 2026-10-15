import React from "react";
import { NavLink } from "react-router-dom";
import { Dumbbell, History, TrendingUp, User } from "lucide-react";
import { cn } from "../utils/cn.js";

const TABS = [
  { to: "/jurnal", label: "Jurnal", icon: Dumbbell },
  { to: "/tarix", label: "Tarix", icon: History },
  { to: "/tahlil", label: "Tahlil", icon: TrendingUp },
  { to: "/profil", label: "Profil", icon: User },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-brand-surface border-t border-brand-line flex px-3 py-2 z-30">
      {TABS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex-1 flex flex-col items-center gap-1 py-1.5 cursor-pointer no-underline transition-colors",
              isActive ? "text-brand-accent" : "text-brand-muted",
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={18} />
              <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
