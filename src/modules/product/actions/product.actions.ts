"use server";

import { revalidatePath } from "next/cache";

import { connectToDatabase } from "@/shared/libs";
import { ProductModel, StockHistoryModel } from "@/shared/schemas";
import {
  CreateProductParams,
  ProductItemData,
  QueryFilter,
  UpdateProductParams,
  UpdateStockParams,
} from "@/shared/types";
import { StockAction } from "@/shared/constants";

export async function createProduct(
  params: CreateProductParams,
): Promise<
  { success: boolean; message?: string; data?: ProductItemData } | undefined
> {
  try {
    await connectToDatabase();

    const existProduct = await ProductModel.findOne({
      $or: [{ slug: params.slug }, { sku: params.sku }],
    });
    if (existProduct) {
      return {
        success: false,
        message: "Product with this slug or SKU already exists!",
      };
    }

    // Handle empty author - don't include if empty string
    const { author, ...rest } = params;
    const createPayload = {
      ...rest,
      ...(author && author.trim() ? { author } : {}),
    };

    const newProduct = await ProductModel.create(createPayload);

    // Create stock history if quantity > 0
    if (newProduct.quantity > 0 && author && author.trim()) {
      await StockHistoryModel.create({
        product: newProduct._id,
        action: StockAction.IN,
        quantity: newProduct.quantity,
        previousQuantity: 0,
        newQuantity: newProduct.quantity,
        note: "Initial stock",
        author,
      });
    }

    revalidatePath("/manage/products");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newProduct)),
    };
  } catch (error) {
    console.log(error);
  }
}

export async function fetchProducts(
  params: QueryFilter,
): Promise<{ products: ProductItemData[]; total: number } | undefined> {
  try {
    await connectToDatabase();

    const { limit = 10, page = 1, search, status } = params;
    const skip = (page - 1) * limit;
    const query: Record<string, any> = { _destroy: false };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const products = await ProductModel.find(query)
      .populate({
        path: "author",
        select: "_id name avatar",
      })
      .populate({
        path: "category",
        select: "_id title slug",
      })
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await ProductModel.countDocuments(query);

    return {
      products: JSON.parse(JSON.stringify(products)),
      total,
    };
  } catch (error) {
    console.log(error);
  }
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductItemData | undefined> {
  try {
    await connectToDatabase();

    const product = await ProductModel.findOne({
      slug,
      _destroy: false,
    })
      .populate({
        path: "author",
        select: "_id name avatar",
      })
      .populate({
        path: "category",
        select: "_id title slug",
      });

    return product ? JSON.parse(JSON.stringify(product)) : undefined;
  } catch (error) {
    console.log(error);
  }
}

export async function updateProduct(
  params: UpdateProductParams,
): Promise<{ success: boolean; message?: string } | undefined> {
  try {
    await connectToDatabase();

    const findProduct = await ProductModel.findOne({ slug: params.slug });
    if (!findProduct) {
      return {
        success: false,
        message: "Product not found!",
      };
    }

    const oldQuantity = findProduct.quantity;
    const newQuantity = params.updateData.quantity;

    // Create stock history if quantity changed
    if (
      newQuantity !== undefined &&
      newQuantity !== oldQuantity &&
      findProduct.author
    ) {
      const quantityDiff = newQuantity - oldQuantity;
      let action = StockAction.ADJUSTMENT;
      if (quantityDiff > 0) {
        action = StockAction.IN;
      } else if (quantityDiff < 0) {
        action = StockAction.OUT;
      }

      await StockHistoryModel.create({
        product: findProduct._id,
        action,
        quantity: Math.abs(quantityDiff),
        previousQuantity: oldQuantity,
        newQuantity,
        note: "Stock update",
        author: findProduct.author,
      });
    }

    await ProductModel.findOneAndUpdate(
      { slug: params.slug },
      params.updateData,
      { new: true },
    );

    revalidatePath(params.path || "/manage/products");

    return {
      success: true,
      message: "Product updated successfully!",
    };
  } catch (error) {
    console.log(error);
  }
}

export async function deleteProduct(
  slug: string,
): Promise<{ success: boolean } | undefined> {
  try {
    await connectToDatabase();

    await ProductModel.findOneAndUpdate({ slug }, { _destroy: true });

    revalidatePath("/manage/products");

    return { success: true };
  } catch (error) {
    console.log(error);
  }
}

export async function updateStock(
  params: UpdateStockParams,
): Promise<{ success: boolean; message?: string } | undefined> {
  try {
    await connectToDatabase();

    const findProduct = await ProductModel.findOne({ slug: params.slug });
    if (!findProduct) {
      return {
        success: false,
        message: "Product not found!",
      };
    }

    const previousQuantity = findProduct.quantity;
    let newQuantity = previousQuantity;

    if (params.action === StockAction.IN) {
      newQuantity = previousQuantity + params.quantity;
    } else if (params.action === StockAction.OUT) {
      newQuantity = Math.max(0, previousQuantity - params.quantity);
    } else if (params.action === StockAction.ADJUSTMENT) {
      newQuantity = params.quantity;
    }

    await StockHistoryModel.create({
      product: findProduct._id,
      action: params.action as StockAction,
      quantity: params.quantity,
      previousQuantity,
      newQuantity,
      note: params.note || "",
      author: findProduct.author,
    });

    await ProductModel.findOneAndUpdate(
      { slug: params.slug },
      { quantity: newQuantity },
      { new: true },
    );

    revalidatePath("/manage/products");

    return {
      success: true,
      message: "Stock updated successfully!",
    };
  } catch (error) {
    console.log(error);
  }
}
