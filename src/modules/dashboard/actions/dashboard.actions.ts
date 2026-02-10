"use server";

import { connectToDatabase } from "@/shared/libs";
import { CategoryModel, ProductModel } from "@/shared/schemas";
import { DashboardStats, ProductItemData } from "@/shared/types";

export async function getDashboardStats(): Promise<
  DashboardStats | undefined
> {
  try {
    await connectToDatabase();

    const [
      totalProducts,
      totalCategories,
      lowStockProducts,
      outOfStockProducts,
      products,
    ] = await Promise.all([
      ProductModel.countDocuments({ _destroy: false }),
      CategoryModel.countDocuments({ _destroy: false }),
      ProductModel.countDocuments({
        _destroy: false,
        $expr: {
          $and: [
            { $lte: ["$quantity", "$minQuantity"] },
            { $gt: ["$quantity", 0] },
          ],
        },
      }),
      ProductModel.countDocuments({
        _destroy: false,
        quantity: 0,
      }),
      ProductModel.find({ _destroy: false })
        .select("price quantity")
        .lean(),
    ]);

    const totalInventoryValue = products.reduce(
      (sum, product) => sum + (product.price || 0) * (product.quantity || 0),
      0,
    );

    return {
      totalProducts,
      totalCategories,
      lowStockProducts,
      outOfStockProducts,
      totalInventoryValue,
    };
  } catch (error) {
    console.log(error);
  }
}

export async function getRecentProducts(): Promise<
  ProductItemData[] | undefined
> {
  try {
    await connectToDatabase();

    const products = await ProductModel.find({ _destroy: false })
      .populate({
        path: "category",
        select: "_id title slug",
      })
      .sort({ created_at: -1 })
      .limit(5)
      .lean();

    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.log(error);
  }
}

export async function getLowStockProducts(): Promise<
  ProductItemData[] | undefined
> {
  try {
    await connectToDatabase();

    const products = await ProductModel.find({
      _destroy: false,
      $expr: {
        $and: [
          { $lte: ["$quantity", "$minQuantity"] },
          { $gt: ["$quantity", 0] },
        ],
      },
    })
      .populate({
        path: "category",
        select: "_id title slug",
      })
      .sort({ quantity: 1 })
      .limit(10)
      .lean();

    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.log(error);
  }
}
