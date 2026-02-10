import { fetchCategories } from "@/modules/category";
import { CategoryPageClient } from "@/modules/category/components";
import { QueryFilter } from "@/shared/types";
import { canEdit } from "@/shared/libs";

export const dynamic = "force-dynamic";

interface CategoriesPageProps {
  searchParams: Promise<QueryFilter>;
}

export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  const params = await searchParams;
  const [result, userCanEdit] = await Promise.all([
    fetchCategories({
      page: Number(params.page) || 1,
      limit: 10,
      search: params.search,
      status: params.status,
    }),
    canEdit(),
  ]);

  return (
    <CategoryPageClient
      categories={result?.categories || []}
      total={result?.total || 0}
      canEdit={userCanEdit}
    />
  );
}
