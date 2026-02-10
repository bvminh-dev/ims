"use client";

import { Edit, Trash2, FolderTree } from "lucide-react";
import { useState } from "react";

import { ITEMS_PER_PAGE } from "@/shared/constants";
import { useQueryString } from "@/shared/hooks";
import { CategoryItemData } from "@/shared/types";
import { ConfirmDialog } from "@/shared/components/ui";
import { Pagination } from "@/shared/components/ui";
import { StatusBadge } from "@/shared/components/ui";

import { deleteCategory } from "../actions";

interface CategoryTableProps {
  categories: CategoryItemData[];
  total: number;
  onEdit: (category: CategoryItemData) => void;
}

export function CategoryTable({
  categories,
  total,
  onEdit,
}: CategoryTableProps) {
  const { currentPage, handleChangePage, handleSearchData, handleSelectStatus } =
    useQueryString();
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleDelete = async () => {
    if (!deleteSlug) return;

    setIsDeleting(true);
    await deleteCategory(deleteSlug);
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
            placeholder="Search categories..."
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
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={String(category._id)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FolderTree className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {category.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {category.description || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={category.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(category.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(category)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteSlug(category.slug)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handleChangePage}
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteSlug !== null}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteSlug(null)}
        loading={isDeleting}
      />
    </>
  );
}
