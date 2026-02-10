import { ProductModelProps } from "./models/product.model";

export type CreateProductParams = {
  title: string;
  slug: string;
  description: string;
  sku: string;
  price: number;
  cost: number;
  quantity: number;
  minQuantity: number;
  category: string;
  image: string;
  status: string;
  author?: string;
};

export type UpdateProductParams = {
  slug: string;
  updateData: Partial<ProductModelProps>;
  path?: string;
};

export type UpdateStockParams = {
  slug: string;
  action: string;
  quantity: number;
  note?: string;
};
