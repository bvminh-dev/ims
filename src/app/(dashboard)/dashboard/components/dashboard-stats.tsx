"use client";

import {
  Package,
  FolderTree,
  AlertTriangle,
  ShoppingCart,
  DollarSign,
} from "lucide-react";

import { StatCard } from "@/shared/components/ui";
import { DashboardStats as DashboardStatsType } from "@/shared/types";

interface DashboardStatsProps {
  stats: DashboardStatsType;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        title="Total Products"
        value={stats.totalProducts}
        icon={Package}
      />
      <StatCard
        title="Categories"
        value={stats.totalCategories}
        icon={FolderTree}
      />
      <StatCard
        title="Low Stock"
        value={stats.lowStockProducts}
        icon={AlertTriangle}
        description="Products below minimum"
      />
      <StatCard
        title="Out of Stock"
        value={stats.outOfStockProducts}
        icon={ShoppingCart}
      />
      <StatCard
        title="Inventory Value"
        value={`$${stats.totalInventoryValue.toLocaleString()}`}
        icon={DollarSign}
      />
    </div>
  );
}
