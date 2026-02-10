import { CategoryModelProps } from "./models/category.model";

export type CreateCategoryParams = {
  title: string;
  slug: string;
  description?: string;
};

export type UpdateCategoryParams = {
  slug: string;
  updateData: Partial<CategoryModelProps>;
  path?: string;
};
