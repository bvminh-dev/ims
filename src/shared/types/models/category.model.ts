import { Document } from "mongoose";

import { CategoryStatus } from "@/shared/constants";

export interface CategoryModelProps extends Document {
  title: string;
  slug: string;
  description: string;
  status: CategoryStatus;
  _destroy: boolean;
  created_at: Date;
}
