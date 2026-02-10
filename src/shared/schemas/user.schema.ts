import { model, models, Schema } from "mongoose";

import { UserRole, UserStatus } from "@/shared/constants";
import { UserModelProps } from "@/shared/types/models/user.model";

const userSchema = new Schema<UserModelProps>({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  avatar: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
  },
  status: {
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.ACTIVE,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export const UserModel =
  models.User || model<UserModelProps>("User", userSchema);
