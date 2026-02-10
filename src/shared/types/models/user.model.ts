import { Document } from "mongoose";

import { UserRole, UserStatus } from "@/shared/constants";

export interface UserModelProps extends Document {
  clerkId: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  created_at: Date;
}
