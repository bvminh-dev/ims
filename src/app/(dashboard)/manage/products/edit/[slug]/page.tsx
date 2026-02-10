import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";

import { ProductForm } from "@/modules/product/components";
import { getProductBySlug } from "@/modules/product";
import { fetchAllCategories } from "@/modules/category";
import { UserModel } from "@/shared/schemas";
import { connectToDatabase, canEdit } from "@/shared/libs";

export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user has permission to edit products
  if (!(await canEdit())) {
    redirect("/manage/products");
  }

  const { slug } = await params;

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

  const [product, categories] = await Promise.all([
    getProductBySlug(slug),
    fetchAllCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
      <ProductForm
        product={product}
        categories={categories || []}
        authorId={mongoUser?._id?.toString()}
      />
    </div>
  );
}
