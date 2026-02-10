import { Document, Schema } from "mongoose";

import { StockAction } from "@/shared/constants";

export interface StockHistoryModelProps extends Document {
  product: Schema.Types.ObjectId;
  action: StockAction;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  note: string;
  author: Schema.Types.ObjectId;
  created_at: Date;
}
