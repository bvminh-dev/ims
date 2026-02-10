# LLM Guide: MongoDB CRUD & Phân trang trong dự án Ucademy

> Tài liệu hướng dẫn LLM (AI) viết code CRUD MongoDB + phân trang theo đúng pattern của dự án.

---

## 1. Kiến trúc tổng quan

```
src/
├── shared/
│   ├── lib/mongoose.ts          # Kết nối DB (singleton)
│   ├── schemas/                 # Mongoose schemas + models
│   ├── types/                   # TypeScript types/interfaces
│   ├── constants/               # Enums + constants
│   └── hooks/use-query-string   # Hook quản lý query params (phân trang, search, filter)
└── modules/
    └── [module]/
        └── actions/
            └── [module].actions.ts  # Server Actions (CRUD)
```

---

## 2. Kết nối Database

File: `src/shared/lib/mongoose.ts`

- Sử dụng **singleton pattern** để tránh kết nối lại nhiều lần.
- Mỗi server action **BẮT BUỘC** gọi `connectToDatabase()` ở đầu hàm.

```typescript
import { connectToDatabase } from "@/shared/lib/mongoose";

export async function myAction() {
  try {
    connectToDatabase(); // Không cần await, nhưng phải gọi
    // ... logic
  } catch (error) {
    console.log(error);
  }
}
```

---

## 3. Định nghĩa Schema

File: `src/shared/schemas/[model].schema.ts`

### Quy tắc:

1. **Sử dụng TypeScript generic** cho schema: `new Schema<ModelProps>({...})`
2. **Export model với pattern Next.js**: tránh recompile khi hot reload
3. **Soft delete** dùng `_destroy: Boolean` (không xóa thật trong DB)
4. **Timestamp** dùng `created_at` với `default: Date.now`
5. **Enum validation** dùng `enum: Object.values(EnumType)`
6. **Reference** dùng `Schema.Types.ObjectId` với `ref: 'ModelName'`

### Template tạo schema mới:

```typescript
import { model, models, Schema } from "mongoose";

import { MyStatus } from "../constants";
import { MyModelProps } from "../types";

const mySchema = new Schema<MyModelProps>({
  title: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(MyStatus),
    default: MyStatus.PENDING,
  },
  // Reference tới model khác
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  // Array references
  items: [
    {
      type: Schema.Types.ObjectId,
      ref: "Item",
    },
  ],
  // Soft delete
  _destroy: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// QUAN TRỌNG: Pattern này tránh lỗi "Cannot overwrite model" trong Next.js
export const MyModel =
  models.MyModel || model<MyModelProps>("MyModel", mySchema);
```

### Nhớ export trong `src/shared/schemas/index.ts`:

```typescript
export * from "./my.schema";
```

---

## 4. Định nghĩa Types

### Model Props (file: `src/shared/types/models/[model].model.ts`):

```typescript
import { Document, Schema } from "mongoose";

import { MyStatus } from "@/shared/constants";

export interface MyModelProps extends Document {
  _id: string;
  title: string;
  status: MyStatus;
  author: Schema.Types.ObjectId;
  items: Schema.Types.ObjectId[];
  _destroy: boolean;
  created_at: Date;
}
```

### Item Data - dùng cho dữ liệu đã populate (file: `src/shared/types/app.type.ts`):

```typescript
export interface MyItemData extends Omit<MyModelProps, "author" | "items"> {
  author: UserItemData; // Đã populate
  items: ItemItemData[]; // Đã populate
}
```

### Params types (file: `src/shared/types/[module].type.ts`):

```typescript
export type CreateMyParams = {
  title: string;
  author: string;
};

export type UpdateMyParams = {
  slug: string;
  updateData: Partial<MyModelProps>;
  path?: string;
};
```

### QueryFilter chung cho phân trang (file: `src/shared/types/common.ts`):

```typescript
export interface QueryFilter {
  limit?: number;
  page?: number;
  search?: string;
  status?: string;
  active?: boolean;
}
```

---

## 5. Server Actions - CRUD Pattern

File: `src/modules/[module]/actions/[module].actions.ts`

### Quy tắc chung:

1. Đầu file **BẮT BUỘC** có `'use server'`
2. Mỗi hàm đều gọi `connectToDatabase()` trong `try`
3. Kết quả Mongoose document phải serialize qua `JSON.parse(JSON.stringify(...))`
4. Error handling: `try/catch` + `console.log(error)`
5. Sau khi thay đổi dữ liệu: gọi `revalidatePath()` để cập nhật cache Next.js
6. Return type luôn có `| undefined` (vì catch block không return)

---

### 5.1 CREATE

```typescript
"use server";

import { revalidatePath } from "next/cache";

import { connectToDatabase } from "@/shared/lib/mongoose";
import { MyModel } from "@/shared/schemas";
import { CreateMyParams } from "@/shared/types";

export async function createMyItem(params: CreateMyParams) {
  try {
    connectToDatabase();

    // Kiểm tra trùng lặp (nếu cần)
    const existItem = await MyModel.findOne({ slug: params.slug });
    if (existItem) {
      return {
        success: false,
        message: "Đã tồn tại!",
      };
    }

    const newItem = await MyModel.create(params);

    revalidatePath("/manage/my-items");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newItem)),
    };
  } catch (error) {
    console.log(error);
  }
}
```

**Lưu ý khi create có quan hệ** (ví dụ: tạo lesson thuộc lecture):

```typescript
export async function createLesson(params: CreateLessonParams) {
  try {
    connectToDatabase();
    const findLecture = await LectureModel.findById(params.lecture);
    if (!findLecture) return;

    const newLesson = await LessonModel.create(params);

    // Push ID vào parent
    findLecture.lessons.push(newLesson._id);
    await findLecture.save();

    revalidatePath(params.path || "/");
    return { success: true };
  } catch (error) {
    console.log(error);
  }
}
```

---

### 5.2 READ - Lấy một item

```typescript
export async function getMyItemBySlug({
  slug,
}: {
  slug: string;
}): Promise<MyItemData | undefined> {
  try {
    connectToDatabase();
    const item = await MyModel.findOne({ slug })
      .populate({
        path: "author",
        model: UserModel,
        select: "name avatar",
      })
      .populate({
        path: "items",
        model: ItemModel,
        match: { _destroy: false }, // Lọc soft delete
        options: { sort: { order: 1 } }, // Sắp xếp
      });

    return JSON.parse(JSON.stringify(item));
  } catch (error) {
    console.log(error);
  }
}
```

---

### 5.3 READ - Danh sách có phân trang (QUAN TRỌNG)

**Pattern chuẩn KHÔNG trả total** (dùng cho danh sách công khai):

```typescript
export async function fetchMyItems(
  params: QueryFilter,
): Promise<MyItemData[] | undefined> {
  try {
    connectToDatabase();
    const { limit = 10, page = 1, search, status } = params;
    const skip = (page - 1) * limit;
    const query: FilterQuery<typeof MyModel> = {};

    // Search
    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }];
    }

    // Filter theo status
    if (status) {
      query.status = status;
    }

    const items = await MyModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    return JSON.parse(JSON.stringify(items));
  } catch (error) {
    console.log(error);
  }
}
```

**Pattern chuẩn CÓ trả total** (dùng cho trang admin, cần hiển thị tổng số trang):

```typescript
import { FilterQuery } from "mongoose";

interface FetchMyItemsResponse {
  total: number;
  items: MyItemData[];
}

export async function fetchMyItems(
  params: QueryFilter,
): Promise<FetchMyItemsResponse | undefined> {
  try {
    connectToDatabase();
    const { limit = 10, page = 1, search, status } = params;
    const skip = (page - 1) * limit;
    const query: FilterQuery<typeof MyModel> = {};

    // Search: tìm kiếm không phân biệt hoa thường
    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }];
    }

    // Filter
    if (status) {
      query.status = status;
    }

    // QUAN TRỌNG: dùng cùng query cho cả find và countDocuments
    const items = await MyModel.find(query)
      .populate({
        path: "relatedField",
        model: RelatedModel,
        select: "title",
      })
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await MyModel.countDocuments(query);

    return {
      items: JSON.parse(JSON.stringify(items)),
      total,
    };
  } catch (error) {
    console.log(error);
  }
}
```

**Công thức phân trang:**

```
skip = (page - 1) * limit
totalPages = Math.ceil(total / limit)
```

| Param   | Default | Mô tả                            |
| ------- | ------- | -------------------------------- |
| `page`  | 1       | Trang hiện tại (1-indexed)       |
| `limit` | 10      | Số item mỗi trang                |
| `skip`  | 0       | Số item bỏ qua = (page-1)\*limit |

---

### 5.4 UPDATE

```typescript
export async function updateMyItem(params: UpdateMyParams) {
  try {
    connectToDatabase();
    const findItem = await MyModel.findOne({ slug: params.slug });
    if (!findItem) return;

    await MyModel.findOneAndUpdate(
      { slug: params.slug },
      params.updateData,
      { new: true }, // Trả về document đã cập nhật
    );

    revalidatePath(params.path || "/");

    return {
      success: true,
      message: "Cập nhật thành công!",
    };
  } catch (error) {
    console.log(error);
  }
}
```

**Update với `$inc`** (tăng giá trị):

```typescript
export async function incrementView({ slug }: { slug: string }) {
  try {
    connectToDatabase();
    await MyModel.findOneAndUpdate({ slug }, { $inc: { views: 1 } });
  } catch (error) {
    console.log(error);
  }
}
```

---

### 5.5 DELETE

**Hard delete** (xóa thật):

```typescript
export async function deleteMyItem(code: string) {
  try {
    connectToDatabase();
    await MyModel.findOneAndDelete({ code });
    revalidatePath("/manage/my-items");
  } catch (error) {
    console.log(error);
  }
}
```

**Soft delete** (đánh dấu `_destroy = true`):

```typescript
export async function softDeleteMyItem(id: string) {
  try {
    connectToDatabase();
    await MyModel.findByIdAndUpdate(id, { _destroy: true });
    revalidatePath("/manage/my-items");
    return { success: true };
  } catch (error) {
    console.log(error);
  }
}
```

---

## 6. Hook phân trang phía Client

File: `src/shared/hooks/use-query-string.tsx` với code:

```tsx
"use client";
import { debounce } from "lodash";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { allValue } from "@/shared/constants";

export const useQueryString = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentPage = Number(searchParams.get("page")) || 1;
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set(name, value);
    if (value === "" || value === allValue) {
      params.delete(name);
    }
    router.push(`${pathname}?${params ? params.toString() : ""}`, {
      scroll: false,
    });
  };
  const handleSearchData = debounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      createQueryString("search", event.target.value);
    },
    250,
  );
  const handleSelectStatus = <T extends string>(status: T | string) => {
    createQueryString("status", status);
  };
  const handleChangePage = (page: number) => {
    createQueryString("page", `${page}`);
  };
  const handleChangeQs = (key: string, value: string) => {
    createQueryString(key, value);
  };

  return {
    createQueryString,
    router,
    pathname,
    handleSearchData,
    handleSelectStatus,
    handleChangePage,
    currentPage,
    handleChangeQs,
  };
};
```

Hook `useQueryString` quản lý query params trên URL cho phân trang, search, filter.

### Cách sử dụng trong component:

```tsx
"use client";

import { useQueryString } from "@/shared/hooks";

function MyListPage() {
  const {
    currentPage, // Trang hiện tại (từ URL param ?page=)
    handleChangePage, // Chuyển trang: handleChangePage(2)
    handleSearchData, // Search debounce 250ms: onChange={handleSearchData}
    handleSelectStatus, // Filter status: handleSelectStatus('APPROVED')
    handleChangeQs, // Thay đổi bất kỳ query: handleChangeQs('sort', 'recent')
  } = useQueryString();

  return (
    <>
      {/* Search input */}
      <input placeholder="Tìm kiếm..." onChange={handleSearchData} />

      {/* Status filter */}
      <select onChange={(e) => handleSelectStatus(e.target.value)}>
        <option value="ALL">Tất cả</option>
        <option value="APPROVED">Đã duyệt</option>
        <option value="PENDING">Chờ duyệt</option>
      </select>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        onPageChange={handleChangePage}
        totalPages={Math.ceil(total / 10)}
      />
    </>
  );
}
```

### Cách truyền params từ Page → Server Action:

```tsx
// src/app/(dashboard)/manage/my-items/page.tsx
import { fetchMyItems } from "@/modules/my-item/actions";
import { QueryFilter } from "@/shared/types";

interface PageProps {
  searchParams: QueryFilter;
}

export default async function MyItemsPage({ searchParams }: PageProps) {
  const result = await fetchMyItems({
    page: searchParams.page || 1,
    limit: 10,
    search: searchParams.search,
    status: searchParams.status,
  });

  return <MyItemsList data={result} />;
}
```

---

## 7. Populate (Join) Pattern

### Populate đơn giản:

```typescript
await MyModel.findOne({ slug }).populate({
  path: "author",
  model: UserModel,
  select: "name avatar", // Chỉ lấy các field cần
});
```

### Populate lồng nhau (nested):

```typescript
await CourseModel.findOne({ slug }).populate({
  path: "lectures",
  model: LectureModel,
  select: "_id title",
  match: { _destroy: false }, // Lọc soft delete
  populate: {
    path: "lessons",
    model: LessonModel,
    match: { _destroy: false },
    options: { sort: { order: 1 } }, // Sắp xếp theo order
  },
});
```

### Populate qua User (lấy danh sách course của user):

```typescript
await UserModel.findOne({ clerkId: userId }).populate({
  path: "courses",
  model: CourseModel,
  match: { status: CourseStatus.APPROVED },
  populate: {
    path: "lectures",
    model: LectureModel,
    select: "lessons",
    populate: {
      path: "lessons",
      model: LessonModel,
      select: "slug",
    },
  },
});
```

---

## 8. Search Pattern

Tìm kiếm không phân biệt hoa thường với regex:

```typescript
if (search) {
  query.$or = [{ title: { $regex: search, $options: "i" } }];
}
```

Tìm kiếm trên nhiều field:

```typescript
if (search) {
  query.$or = [
    { title: { $regex: search, $options: "i" } },
    { code: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
  ];
}
```

---

## 9. Aggregation Pattern

Tính toán tổng hợp (ví dụ: đếm số lesson và tổng duration):

```typescript
export async function getCourseLessonsInfo({
  slug,
}: {
  slug: string;
}): Promise<CourseLessonData | undefined> {
  try {
    connectToDatabase();
    const course = await CourseModel.findOne({ slug })
      .select("lectures")
      .populate({
        path: "lectures",
        select: "lessons",
        populate: {
          path: "lessons",
          select: "duration",
        },
      });

    const lessons = course?.lectures.flatMap((l) => l.lessons) || [];
    const duration = lessons.reduce((acc, cur) => acc + cur.duration, 0) || 0;

    return { duration, lessons: lessons.length };
  } catch (error) {
    console.log(error);
  }
}
```

---

## 10. Checklist khi tạo CRUD mới

### Bước 1: Tạo Enum (nếu cần)

- File: `src/shared/constants/enums.ts`
- Thêm export vào `src/shared/constants/index.ts`

### Bước 2: Tạo Type

- Model props: `src/shared/types/models/[model].model.ts`
- Item data (populate): `src/shared/types/app.type.ts`
- Params (create/update): `src/shared/types/[module].type.ts`
- Thêm export vào `src/shared/types/index.ts`

### Bước 3: Tạo Schema

- File: `src/shared/schemas/[model].schema.ts`
- Thêm export vào `src/shared/schemas/index.ts`

### Bước 4: Tạo Server Actions

- File: `src/modules/[module]/actions/[module].actions.ts`
- Tạo `index.ts` export: `export * from './[module].actions'`

### Bước 5: Tạo Page (nếu cần phân trang)

- Server Component nhận `searchParams`
- Truyền params vào server action
- Client Component dùng `useQueryString` hook

---

## 11. Tóm tắt các Pattern quan trọng

| Pattern                   | Cách dùng                                              |
| ------------------------- | ------------------------------------------------------ |
| Kết nối DB                | `connectToDatabase()` đầu mỗi action                   |
| Model export              | `models.X \|\| model<Props>('X', schema)`              |
| Serialize                 | `JSON.parse(JSON.stringify(doc))`                      |
| Phân trang                | `skip = (page-1) * limit` → `.skip(skip).limit(limit)` |
| Đếm tổng                  | `Model.countDocuments(query)` (cùng query với find)    |
| Search                    | `{ field: { $regex: search, $options: 'i' } }`         |
| Sort                      | `.sort({ created_at: -1 })` (mới nhất trước)           |
| Soft delete               | `_destroy: Boolean` → filter `{ _destroy: false }`     |
| Revalidate cache          | `revalidatePath(path)` sau mỗi mutation                |
| Client pagination         | `useQueryString()` → `handleChangePage`, `currentPage` |
| URL query → Server action | `searchParams` prop từ Next.js Page                    |
| Error handling            | `try/catch` + `console.log(error)`, return `undefined` |

---

## 12. Ví dụ hoàn chỉnh: Module "Blog" với CRUD + Phân trang

### 12.1 Enum

```typescript
// src/shared/constants/enums.ts
export enum BlogStatus {
  PUBLISHED = "PUBLISHED",
  DRAFT = "DRAFT",
  ARCHIVED = "ARCHIVED",
}
```

### 12.2 Type

```typescript
// src/shared/types/models/blog.model.ts
import { Document, Schema } from "mongoose";
import { BlogStatus } from "@/shared/constants";

export interface BlogModelProps extends Document {
  _id: string;
  title: string;
  slug: string;
  content: string;
  status: BlogStatus;
  author: Schema.Types.ObjectId;
  _destroy: boolean;
  created_at: Date;
}
```

```typescript
// src/shared/types/blog.type.ts
import { BlogModelProps } from "./models";

export type CreateBlogParams = {
  title: string;
  slug: string;
  author: string;
};

export type UpdateBlogParams = {
  slug: string;
  updateData: Partial<BlogModelProps>;
  path?: string;
};
```

### 12.3 Schema

```typescript
// src/shared/schemas/blog.schema.ts
import { model, models, Schema } from "mongoose";
import { BlogStatus } from "../constants";
import { BlogModelProps } from "../types/models/blog.model";

const blogSchema = new Schema<BlogModelProps>({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  content: { type: String, default: "" },
  status: {
    type: String,
    enum: Object.values(BlogStatus),
    default: BlogStatus.DRAFT,
  },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  _destroy: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

export const BlogModel =
  models.Blog || model<BlogModelProps>("Blog", blogSchema);
```

### 12.4 Server Actions

```typescript
// src/modules/blog/actions/blog.actions.ts
"use server";

import { FilterQuery } from "mongoose";
import { revalidatePath } from "next/cache";

import { connectToDatabase } from "@/shared/lib/mongoose";
import { BlogModel, UserModel } from "@/shared/schemas";
import {
  CreateBlogParams,
  QueryFilter,
  UpdateBlogParams,
} from "@/shared/types";

// CREATE
export async function createBlog(params: CreateBlogParams) {
  try {
    connectToDatabase();
    const existBlog = await BlogModel.findOne({ slug: params.slug });
    if (existBlog) {
      return { success: false, message: "Slug đã tồn tại!" };
    }
    const blog = await BlogModel.create(params);
    revalidatePath("/manage/blog");
    return { success: true, data: JSON.parse(JSON.stringify(blog)) };
  } catch (error) {
    console.log(error);
  }
}

// READ - danh sách có phân trang + search + filter + total
export async function fetchBlogs(
  params: QueryFilter,
): Promise<{ blogs: BlogModelProps[]; total: number } | undefined> {
  try {
    connectToDatabase();
    const { limit = 10, page = 1, search, status } = params;
    const skip = (page - 1) * limit;
    const query: FilterQuery<typeof BlogModel> = { _destroy: false };

    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }];
    }
    if (status) {
      query.status = status;
    }

    const blogs = await BlogModel.find(query)
      .populate({ path: "author", model: UserModel, select: "name avatar" })
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await BlogModel.countDocuments(query);

    return {
      blogs: JSON.parse(JSON.stringify(blogs)),
      total,
    };
  } catch (error) {
    console.log(error);
  }
}

// READ - chi tiết
export async function getBlogBySlug({ slug }: { slug: string }) {
  try {
    connectToDatabase();
    const blog = await BlogModel.findOne({ slug, _destroy: false }).populate({
      path: "author",
      model: UserModel,
      select: "name avatar",
    });
    return JSON.parse(JSON.stringify(blog));
  } catch (error) {
    console.log(error);
  }
}

// UPDATE
export async function updateBlog(params: UpdateBlogParams) {
  try {
    connectToDatabase();
    const findBlog = await BlogModel.findOne({ slug: params.slug });
    if (!findBlog) return;

    await BlogModel.findOneAndUpdate({ slug: params.slug }, params.updateData, {
      new: true,
    });
    revalidatePath(params.path || "/");
    return { success: true, message: "Cập nhật thành công!" };
  } catch (error) {
    console.log(error);
  }
}

// DELETE (soft)
export async function deleteBlog(slug: string) {
  try {
    connectToDatabase();
    await BlogModel.findOneAndUpdate({ slug }, { _destroy: true });
    revalidatePath("/manage/blog");
    return { success: true };
  } catch (error) {
    console.log(error);
  }
}
```

### 12.5 Page với phân trang

```tsx
// src/app/(dashboard)/manage/blog/page.tsx
import { fetchBlogs } from "@/modules/blog/actions";
import { QueryFilter } from "@/shared/types";
import BlogList from "./components/blog-list";

interface PageProps {
  searchParams: QueryFilter;
}

export default async function BlogManagePage({ searchParams }: PageProps) {
  const result = await fetchBlogs({
    page: searchParams.page || 1,
    limit: 10,
    search: searchParams.search,
    status: searchParams.status,
  });

  return <BlogList blogs={result?.blogs || []} total={result?.total || 0} />;
}
```

```tsx
// Client component với pagination
"use client";

import { useQueryString } from "@/shared/hooks";
import { ITEMS_PER_PAGE } from "@/shared/constants";

function BlogList({ blogs, total }: { blogs: any[]; total: number }) {
  const {
    currentPage,
    handleChangePage,
    handleSearchData,
    handleSelectStatus,
  } = useQueryString();
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      <input placeholder="Tìm kiếm..." onChange={handleSearchData} />
      {/* Render blogs */}
      {/* Pagination controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handleChangePage}
      />
    </div>
  );
}
```
