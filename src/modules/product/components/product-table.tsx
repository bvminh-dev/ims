"use client";

import { Edit, Trash2, Package, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ITEMS_PER_PAGE } from "@/shared/constants";
import { useQueryString } from "@/shared/hooks";
import { ProductItemData } from "@/shared/types";
import { ConfirmDialog, Pagination, StatusBadge } from "@/shared/components/ui";

import { deleteProduct } from "../actions";

interface ProductTableProps {
  products: ProductItemData[];
  total: number;
  canEdit: boolean;
}

export function ProductTable({ products, total, canEdit }: ProductTableProps) {
  const {
    currentPage,
    handleChangePage,
    handleSearchData,
    handleSelectStatus,
  } = useQueryString();
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, total);

  const handleDelete = async () => {
    if (!deleteSlug) return;

    setIsDeleting(true);
    const result = await deleteProduct(deleteSlug);
    if (result?.success === false && result?.message) {
      alert(result.message);
    }
    setIsDeleting(false);
    setDeleteSlug(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-4">
          <input
            type="text"
            placeholder="Search products..."
            onChange={handleSearchData}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            onChange={(e) => handleSelectStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
          {canEdit && (
            <Link
              href="/manage/products/create"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {canEdit && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const isLowStock = product.quantity <= product.minQuantity;

                return (
                  <tr key={String(product._id)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {product.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm text-gray-900">
                        {product.sku}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category?.title || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            isLowStock ? "text-red-600" : "text-gray-900"
                          }`}
                        >
                          {product.quantity}
                        </span>
                        {isLowStock && (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                            Low stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={product.status} />
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/manage/products/edit/${product.slug}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteSlug(product.slug)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {startItem} to {endItem} of {total} results
          </p>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handleChangePage}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteSlug !== null}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteSlug(null)}
        loading={isDeleting}
      />
    </>
  );
}
