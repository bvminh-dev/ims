import {
  getDashboardStats,
  getRecentProducts,
  getLowStockProducts,
} from "@/modules/dashboard";
import { ProductItemData } from "@/shared/types";
import { StatusBadge } from "@/shared/components/ui";
import Link from "next/link";

import { DashboardStats } from "./components/dashboard-stats";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, recentProducts, lowStockProducts] = await Promise.all([
    getDashboardStats(),
    getRecentProducts(),
    getLowStockProducts(),
  ]);

  if (!stats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Cards */}
      <DashboardStats stats={stats} />

      {/* Recent Products & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Products</h2>
          <div className="space-y-3">
            {recentProducts && recentProducts.length > 0 ? (
              recentProducts.map((product: ProductItemData) => (
                <Link
                  key={String(product._id)}
                  href={`/manage/products/edit/${product.slug}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-200"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {product.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.category?.title || "No category"}
                    </div>
                  </div>
                  <StatusBadge status={product.status} />
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent products</p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Low Stock Alerts</h2>
          <div className="space-y-3">
            {lowStockProducts && lowStockProducts.length > 0 ? (
              lowStockProducts.map((product: ProductItemData) => (
                <Link
                  key={String(product._id)}
                  href={`/manage/products/edit/${product.slug}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-red-200 bg-red-50"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {product.title}
                    </div>
                    <div className="text-sm text-red-600">
                      {product.quantity} / {product.minQuantity} (min)
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    Low
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No low stock alerts</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
