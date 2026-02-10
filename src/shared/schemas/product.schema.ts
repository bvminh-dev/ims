import { model, models, Schema } from "mongoose";

import { ProductStatus } from "@/shared/constants";
import { ProductModelProps } from "@/shared/types/models/product.model";

const productSchema = new Schema<ProductModelProps>({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: "",
  },
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  cost: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  minQuantity: {
    type: Number,
    required: true,
    default: 5,
    min: 0,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  image: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: Object.values(ProductStatus),
    default: ProductStatus.ACTIVE,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  _destroy: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export const ProductModel =
  models.Product || model<ProductModelProps>("Product", productSchema);
