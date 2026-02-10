## Init connect db

In folder lib, create 2 file:

```ts
// index.ts
export * from "./mongoose";
```

```ts
// mongoose.ts
"use server";

import mongoose from "mongoose";

// singleton connection
let isConnected: boolean = false;

export const connectToDatabase = async () => {
  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL is not set");
  }
  if (isConnected) {
    console.log("MONGODB is already connected");

    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    isConnected = true;
    console.log("Using new database connection");
  } catch {
    console.log("Error while connecting to database");
  }
};
```

In folder schemas has structure:

- index.ts, include export schema

```ts
export * from "./user.schema";
```

- user.schema has code example:

```ts
import { model, models, Schema } from "mongoose";

import { UserRole, UserStatus } from "../constants";
import { UserModelProps } from "../types";

const userSchema = new Schema<UserModelProps>({
  clerkId: {
    type: String,
  },
  name: {
    type: String,
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  avatar: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
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
});

export const UserModel =
  models.User || model<UserModelProps>("User", userSchema);
```

- In folder constants, create file enums.ts

```ts
export enum UserStatus {
  ACTIVE = "ACTIVE",
  UNACTIVE = "UNACTIVE",
  BANNED = "BANNED",
}
export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}
```
