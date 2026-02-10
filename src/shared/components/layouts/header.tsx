"use client";

import { Menu } from "lucide-react";
import { SignedIn, UserButton } from "@clerk/nextjs";

import { useAppStore } from "@/shared/stores/app-store";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { toggleSidebar } = useAppStore();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && <h1 className="text-xl font-semibold text-gray-900">{title}</h1>}
      </div>
      <div className="flex items-center gap-4">
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
