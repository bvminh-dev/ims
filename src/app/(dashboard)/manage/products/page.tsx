import { Suspense } from "react";

import { fetchProducts } from "@/modules/product";
import { ProductTable } from "@/modules/product/components";
import { QueryFilter } from "@/shared/types";
import { canEdit } from "@/shared/libs";

export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams: Promise<QueryFilter>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const [result, userCanEdit] = await Promise.all([
    fetchProducts({
      page: Number(params.page) || 1,
      limit: 10,
      search: params.search,
      status: params.status,
    }),
    canEdit(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Products</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ProductTable
          products={result?.products || []}
          total={result?.total || 0}
          canEdit={userCanEdit}
        />
      </Suspense>
    </div>
  );
}
