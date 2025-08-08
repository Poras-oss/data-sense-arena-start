import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "https://dashboard.datasenseai.com",
    },
    {
      icon: UserRound,
      label: "Profile",
      path: "/profile",
    },
  ];

  return (
    <header
      className="w-full z-50 bg-[#008B8B] border-0  shadow-xl flex items-center justify-between px-6 h-20 fixed top-0 left-0 right-0"
      style={{ minHeight: "5rem" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img
          src="/images/logo.png"
          alt="Logo"
          className="h-7 md:h-9"
        />
      </div>

      {/* Nav Items */}
      <nav className="flex items-center gap-6">
        {navItems.map((item) => {
          // Only show Profile as a button if not using Clerk's UserButton
          if (item.label === "Profile") {
            return (
              <div key={item.label} className="flex items-center">
                <SignedIn>
                  <Link to={item.path} className="flex items-center">
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox:
                            "w-11 h-11 border-2 border-dsb-accent shadow-lg bg-black/60",
                        },
                      }}
                    />
                  </Link>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button
                      className="w-11 h-11 rounded-full flex items-center justify-center bg-black/60 border-2 border-dsb-accent shadow-lg"
                      variant="ghost"
                    >
                      <UserRound className="!w-7 !h-7 text-dsb-accent" />
                    </Button>
                  </SignInButton>
                </SignedOut>
              </div>
            );
          }
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-base font-medium",
                isActive
                  ? "bg-gradient-to-br from-dsb-accent/30 to-dsb-accent/10 text-dsb-accent shadow-lg"
                  : "hover:bg-dsb-accent/10 hover:text-dsb-accent text-white"
              )}
            >
              <item.icon className="!size-6 drop-shadow-md" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
};

export default Navbar;
