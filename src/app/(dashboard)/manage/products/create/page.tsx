import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { ProductForm } from "@/modules/product/components";
import { fetchAllCategories } from "@/modules/category";
import { UserModel } from "@/shared/schemas";
import { connectToDatabase, canEdit } from "@/shared/libs";

export const dynamic = "force-dynamic";

export default async function CreateProductPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user has permission to create products
  if (!(await canEdit())) {
    redirect("/manage/products");
  }

  // Get or create user in MongoDB
  await connectToDatabase();
  const clerkUser = await currentUser();
  let mongoUser = await UserModel.findOne({ clerkId: userId });

  if (!mongoUser && clerkUser) {
    mongoUser = await UserModel.create({
      clerkId: userId,
      name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User",
      username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress || "",
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      avatar: clerkUser.imageUrl || "",
    });
  }

  const categories = await fetchAllCategories();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Create Product</h1>
      <ProductForm
        categories={categories || []}
        authorId={mongoUser?._id?.toString()}
      />
    </div>
  );
}
