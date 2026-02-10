"use server";

import { revalidatePath } from "next/cache";

import { connectToDatabase, canEdit } from "@/shared/libs";
import { CategoryModel } from "@/shared/schemas";
import {
  CategoryItemData,
  CreateCategoryParams,
  QueryFilter,
  UpdateCategoryParams,
} from "@/shared/types";

export async function createCategory(
  params: CreateCategoryParams,
): Promise<{ success: boolean; message?: string; data?: CategoryItemData } | undefined> {
  try {
    // Check if user has permission to create
    if (!(await canEdit())) {
      return {
        success: false,
        message: "You don't have permission to create categories. Only admins can perform this action.",
      };
    }

    await connectToDatabase();

    const existCategory = await CategoryModel.findOne({ slug: params.slug });
    if (existCategory) {
      return {
        success: false,
        message: "Category with this slug already exists!",
      };
    }

    const newCategory = await CategoryModel.create(params);

    revalidatePath("/manage/categories");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newCategory)),
    };
  } catch (error) {
    console.log(error);
  }
}

export async function fetchCategories(
  params: QueryFilter,
): Promise<{ categories: CategoryItemData[]; total: number } | undefined> {
  try {
    await connectToDatabase();

    const { limit = 10, page = 1, search, status } = params;
    const skip = (page - 1) * limit;
    const query: Record<string, any> = { _destroy: false };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const categories = await CategoryModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await CategoryModel.countDocuments(query);

    return {
      categories: JSON.parse(JSON.stringify(categories)),
      total,
    };
  } catch (error) {
    console.log(error);
  }
}

export async function fetchAllCategories(): Promise<
  CategoryItemData[] | undefined
> {
  try {
    await connectToDatabase();

    const categories = await CategoryModel.find({
      _destroy: false,
      status: "ACTIVE",
    })
      .sort({ title: 1 })
      .select("_id title slug");

    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.log(error);
  }
}

export async function getCategoryBySlug(
  slug: string,
): Promise<CategoryItemData | undefined> {
  try {
    await connectToDatabase();

    const category = await CategoryModel.findOne({
      slug,
      _destroy: false,
    });

    return category ? JSON.parse(JSON.stringify(category)) : undefined;
  } catch (error) {
    console.log(error);
  }
}

export async function updateCategory(
  params: UpdateCategoryParams,
): Promise<{ success: boolean; message?: string } | undefined> {
  try {
    // Check if user has permission to update
    if (!(await canEdit())) {
      return {
        success: false,
        message: "You don't have permission to update categories. Only admins can perform this action.",
      };
    }

    await connectToDatabase();

    const findCategory = await CategoryModel.findOne({ slug: params.slug });
    if (!findCategory) {
      return {
        success: false,
        message: "Category not found!",
      };
    }

    await CategoryModel.findOneAndUpdate(
      { slug: params.slug },
      params.updateData,
      { new: true },
    );

    revalidatePath(params.path || "/manage/categories");

    return {
      success: true,
      message: "Category updated successfully!",
    };
  } catch (error) {
    console.log(error);
  }
}

export async function deleteCategory(
  slug: string,
): Promise<{ success: boolean; message?: string } | undefined> {
  try {
    // Check if user has permission to delete
    if (!(await canEdit())) {
      return {
        success: false,
        message: "You don't have permission to delete categories. Only admins can perform this action.",
      };
    }

    await connectToDatabase();

    await CategoryModel.findOneAndUpdate({ slug }, { _destroy: true });

    revalidatePath("/manage/categories");

    return { success: true, message: "Category deleted successfully!" };
  } catch (error) {
    console.log(error);
  }
}
