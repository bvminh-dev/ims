import { model, models, Schema } from "mongoose";

import { StockAction } from "@/shared/constants";
import { StockHistoryModelProps } from "@/shared/types/models/stock-history.model";

const stockHistorySchema = new Schema<StockHistoryModelProps>({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  action: {
    type: String,
    enum: Object.values(StockAction),
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  previousQuantity: {
    type: Number,
    required: true,
  },
  newQuantity: {
    type: Number,
    required: true,
  },
  note: {
    type: String,
    default: "",
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export const StockHistoryModel =
  models.StockHistory ||
  model<StockHistoryModelProps>("StockHistory", stockHistorySchema);
