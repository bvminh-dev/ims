import { model, models, Schema } from "mongoose";

import { CategoryStatus } from "@/shared/constants";
import { CategoryModelProps } from "@/shared/types/models/category.model";

const categorySchema = new Schema<CategoryModelProps>({
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
  status: {
    type: String,
    enum: Object.values(CategoryStatus),
    default: CategoryStatus.ACTIVE,
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

export const CategoryModel =
  models.Category || model<CategoryModelProps>("Category", categorySchema);
