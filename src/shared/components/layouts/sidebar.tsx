"use client";

import {
  LayoutDashboard,
  Package,
  FolderTree,
  Menu,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAppStore } from "@/shared/stores/app-store";

const menuItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/manage/products",
    label: "Products",
    icon: Package,
  },
  {
    href: "/manage/categories",
    label: "Categories",
    icon: FolderTree,
  },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-slate-800 text-slate-200 transition-all duration-300 z-40 ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Warehouse className="w-6 h-6" />
            {sidebarOpen && (
              <span className="font-bold text-lg">IMS</span>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-slate-700"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "hover:bg-slate-700 text-slate-200"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
