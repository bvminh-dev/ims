"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { CategoryItemData } from "@/shared/types";
import { CategoryTable } from "./category-table";
import { CategoryFormDialog } from "./category-form-dialog";

interface CategoryPageClientProps {
  categories: CategoryItemData[];
  total: number;
  canEdit: boolean;
}

export function CategoryPageClient({
  categories,
  total,
  canEdit,
}: CategoryPageClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCategory, setEditCategory] =
    useState<CategoryItemData | null>(null);

  const handleEdit = (category: CategoryItemData) => {
    setEditCategory(category);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
        {canEdit && (
          <button
            onClick={() => {
              setEditCategory(null);
              setDialogOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        )}
      </div>

      <CategoryTable
        categories={categories}
        total={total}
        onEdit={handleEdit}
        canEdit={canEdit}
      />

      <CategoryFormDialog
        open={dialogOpen}
        category={editCategory}
        onClose={handleClose}
      />
    </div>
  );
}
