import { Document, Schema } from "mongoose";

import { ProductStatus } from "@/shared/constants";

export interface ProductModelProps extends Document {
  title: string;
  slug: string;
  description: string;
  sku: string;
  price: number;
  cost: number;
  quantity: number;
  minQuantity: number;
  category: Schema.Types.ObjectId;
  image: string;
  status: ProductStatus;
  author: Schema.Types.ObjectId;
  _destroy: boolean;
  created_at: Date;
}
