import { CategoryModelProps } from "./models/category.model";
import { ProductModelProps } from "./models/product.model";
import { StockHistoryModelProps } from "./models/stock-history.model";
import { UserModelProps } from "./models/user.model";

export interface UserItemData {
  _id: string;
  name: string;
  avatar: string;
}

export interface CategoryItemData extends CategoryModelProps {}

export interface ProductItemData
  extends Omit<ProductModelProps, "author" | "category"> {
  author: UserItemData;
  category: {
    _id: string;
    title: string;
    slug: string;
  };
}

export interface StockHistoryItemData
  extends Omit<StockHistoryModelProps, "product" | "author"> {
  product: {
    _id: string;
    title: string;
    slug: string;
  };
  author: UserItemData;
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalInventoryValue: number;
}
