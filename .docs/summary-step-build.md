# Hướng dẫn xây dựng IMS - Inventory Management System

> Tài liệu step-by-step để AI hoặc developer tái tạo lại toàn bộ dự án IMS từ đầu.
> Tech stack: Next.js 16 (App Router) + Clerk + Mongoose 9 + Tailwind CSS 4 + Zustand + TypeScript.

---

## Mục lục

1. [Khởi tạo dự án & cài dependencies](#bước-1-khởi-tạo-dự-án--cài-dependencies)
2. [Cấu trúc thư mục](#bước-2-tạo-cấu-trúc-thư-mục)
3. [Cấu hình môi trường & file gốc](#bước-3-cấu-hình-môi-trường--file-gốc)
4. [Shared: Libs, Constants, Types](#bước-4-shared-libs-constants-types)
5. [Shared: Mongoose Schemas](#bước-5-shared-mongoose-schemas)
6. [Shared: Hooks & Stores](#bước-6-shared-hooks--stores)
7. [Shared: UI Components](#bước-7-shared-ui-components)
8. [Shared: Layout Components (Sidebar + Header)](#bước-8-shared-layout-components)
9. [Clerk Authentication Setup](#bước-9-clerk-authentication-setup)
10. [Module: Category (Actions + Components)](#bước-10-module-category)
11. [Module: Product (Actions + Components)](#bước-11-module-product)
12. [Module: Dashboard (Actions)](#bước-12-module-dashboard)
13. [App Router: Pages & Routes](#bước-13-app-router-pages--routes)
14. [Lưu ý quan trọng & Bug đã sửa](#bước-14-lưu-ý-quan-trọng--bug-đã-sửa)

---

## Bước 1: Khởi tạo dự án & cài dependencies

### 1.1 Scaffold Next.js

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

### 1.2 Cài thêm dependencies

```bash
npm install @clerk/nextjs mongoose lodash lucide-react zustand slugify
npm install -D @types/lodash
```

### 1.3 Dependencies cuối cùng trong package.json

```json
{
  "dependencies": {
    "@clerk/nextjs": "^6.37.3",
    "lodash": "^4.17.23",
    "lucide-react": "^0.563.0",
    "mongoose": "^9.2.0",
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "slugify": "^1.6.6",
    "zustand": "^5.0.11"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/lodash": "^4.17.23",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

---

## Bước 2: Tạo cấu trúc thư mục

```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                          # Protected layout, check auth
│   │   ├── dashboard/page.tsx                  # Trang tổng quan
│   │   └── manage/
│   │       ├── products/
│   │       │   ├── page.tsx                    # Danh sách sản phẩm
│   │       │   ├── create/page.tsx             # Tạo sản phẩm
│   │       │   └── edit/[slug]/page.tsx        # Sửa sản phẩm
│   │       └── categories/page.tsx             # Danh sách danh mục
│   ├── globals.css
│   ├── layout.tsx                              # Root layout với ClerkProvider
│   └── page.tsx                                # Landing page
├── modules/
│   ├── product/
│   │   ├── actions/product.actions.ts          # Server Actions CRUD
│   │   ├── actions/index.ts
│   │   ├── components/product-table.tsx        # Bảng danh sách
│   │   ├── components/product-form.tsx         # Form tạo/sửa
│   │   ├── components/index.ts
│   │   └── index.ts
│   ├── category/
│   │   ├── actions/category.actions.ts
│   │   ├── actions/index.ts
│   │   ├── components/category-table.tsx
│   │   ├── components/category-form-dialog.tsx # Dialog tạo/sửa
│   │   ├── components/category-page-client.tsx # Client wrapper
│   │   ├── components/index.ts
│   │   └── index.ts
│   └── dashboard/
│       ├── actions/dashboard.actions.ts
│       ├── actions/index.ts
│       └── index.ts
├── shared/
│   ├── components/
│   │   ├── layouts/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── index.ts
│   │   ├── ui/
│   │   │   ├── pagination.tsx
│   │   │   ├── status-badge.tsx
│   │   │   ├── stat-card.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── confirm-dialog.tsx
│   │   │   └── index.ts
│   │   ├── common/index.ts
│   │   └── icons/index.ts
│   ├── constants/
│   │   ├── enums.ts
│   │   ├── app.constant.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── use-query-string.tsx
│   │   └── index.ts
│   ├── libs/
│   │   ├── mongoose.ts
│   │   └── index.ts
│   ├── schemas/
│   │   ├── user.schema.ts
│   │   ├── product.schema.ts
│   │   ├── category.schema.ts
│   │   ├── stock-history.schema.ts
│   │   └── index.ts
│   ├── stores/
│   │   └── app-store.ts
│   ├── types/
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   ├── product.model.ts
│   │   │   ├── category.model.ts
│   │   │   ├── stock-history.model.ts
│   │   │   └── index.ts
│   │   ├── app.type.ts
│   │   ├── common.ts
│   │   ├── product.type.ts
│   │   ├── category.type.ts
│   │   └── index.ts
│   └── contexts/index.ts
└── proxy.ts                                    # Clerk middleware (Next.js 16 dùng proxy.ts)
```

---

## Bước 3: Cấu hình môi trường & file gốc

### 3.1 `.env.example`

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_SECRET_KEY

# Clerk routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# MongoDB
MONGODB_URL=mongodb://localhost:27017/ims
```

### 3.2 `.gitignore`

Phải bao gồm: `node_modules`, `.next/`, `.env`, `.env*.local`, `.DS_Store`, `*.tsbuildinfo`, `next-env.d.ts`.

### 3.3 `globals.css` - CSS variables cho Tailwind

Định nghĩa các biến CSS custom cho theme:

| Biến              | Giá trị   | Mô tả              |
| ----------------- | --------- | ------------------ |
| `--background`    | `#f8fafc` | Nền app            |
| `--foreground`    | `#0f172a` | Chữ chính          |
| `--sidebar-bg`    | `#1e293b` | Nền sidebar        |
| `--sidebar-text`  | `#e2e8f0` | Chữ sidebar        |
| `--primary`       | `#3b82f6` | Màu chính (blue)   |
| `--primary-hover` | `#2563eb` | Hover màu chính    |
| `--success`       | `#22c55e` | Thành công (green) |
| `--warning`       | `#f59e0b` | Cảnh báo (amber)   |
| `--danger`        | `#ef4444` | Nguy hiểm (red)    |
| `--muted`         | `#64748b` | Chữ phụ (gray)     |

Dùng `@theme inline { }` để đăng ký biến vào Tailwind 4 (ví dụ `--color-primary: var(--primary)`).

---

## Bước 4: Shared - Libs, Constants, Types

### 4.1 Kết nối MongoDB (`src/shared/libs/mongoose.ts`)

- **BẮT BUỘC** `"use server"` ở đầu file.
- Singleton pattern: biến `isConnected` check trước khi connect.
- Throw error nếu thiếu `MONGODB_URL`.
- Export `connectToDatabase()`.

### 4.2 Enums (`src/shared/constants/enums.ts`)

```typescript
export enum UserStatus { ACTIVE, UNACTIVE, BANNED }
export enum UserRole { ADMIN, USER }
export enum ProductStatus { ACTIVE, INACTIVE, OUT_OF_STOCK }
export enum CategoryStatus { ACTIVE, INACTIVE }
export enum StockAction { IN, OUT, ADJUSTMENT }
```

### 4.3 App constants (`src/shared/constants/app.constant.ts`)

```typescript
export const ITEMS_PER_PAGE = 10;
export const allValue = "ALL";
export const APP_NAME = "Inventory Management System";
```

### 4.4 Model Types (`src/shared/types/models/`)

**Quy tắc quan trọng cho Mongoose 9:**
- Model interface extend `Document` nhưng **KHÔNG khai báo `_id: string`** (Mongoose 9 tự handle `_id` type là `ObjectId`).
- Khi render trong JSX, dùng `String(item._id)` cho `key` prop.
- Khi lấy `_id` làm string, dùng `item._id?.toString()`.

**user.model.ts:**

```typescript
import { Document } from "mongoose";
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
```

**product.model.ts:**

```typescript
import { Document, Schema } from "mongoose";
export interface ProductModelProps extends Document {
  title: string;
  slug: string;
  description: string;
  sku: string;
  price: number;
  cost: number;
  quantity: number;
  minQuantity: number;
  category: Schema.Types.ObjectId;
  image: string;
  status: ProductStatus;
  author: Schema.Types.ObjectId;
  _destroy: boolean;
  created_at: Date;
}
```

**category.model.ts:**

```typescript
import { Document } from "mongoose";
export interface CategoryModelProps extends Document {
  title: string;
  slug: string;
  description: string;
  status: CategoryStatus;
  _destroy: boolean;
  created_at: Date;
}
```

**stock-history.model.ts:**

```typescript
import { Document, Schema } from "mongoose";
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
```

### 4.5 App Types (`src/shared/types/app.type.ts`)

Định nghĩa data đã populate cho phía client:

- `ProductItemData` — Omit `author | category` từ model, thay bằng Pick chỉ `_id, name, avatar` (author) và `_id, title, slug` (category).
- `StockHistoryItemData` — tương tự.
- `CategoryItemData` — extends thẳng từ `CategoryModelProps`.
- `DashboardStats` — `totalProducts, totalCategories, lowStockProducts, outOfStockProducts, totalInventoryValue`.

### 4.6 Params Types

- `CreateProductParams`: tất cả field cần thiết, `author` là **optional** (`author?: string`) vì user có thể chưa tồn tại trong MongoDB.
- `UpdateProductParams`: `slug` + `updateData: Partial<ProductModelProps>` + `path?`.
- `CreateCategoryParams`: `title, slug, description?`.
- `UpdateCategoryParams`: `slug` + `updateData: Partial<CategoryModelProps>` + `path?`.

### 4.7 Common Types (`src/shared/types/common.ts`)

```typescript
export interface QueryFilter {
  limit?: number;
  page?: number;
  search?: string;
  status?: string;
  active?: boolean;
}
```

### 4.8 Tất cả index.ts export

Mỗi thư mục (`constants/`, `types/`, `types/models/`, `schemas/`, `hooks/`, `libs/`) đều có `index.ts` re-export tất cả.

---

## Bước 5: Shared - Mongoose Schemas

### Quy tắc tạo schema

1. `new Schema<ModelProps>({...})` — dùng generic.
2. Export model: `models.X || model<Props>('X', schema)` — tránh lỗi "Cannot overwrite model" khi hot reload.
3. Soft delete: field `_destroy: { type: Boolean, default: false }`.
4. Timestamp: `created_at: { type: Date, default: Date.now }`.
5. Enum validation: `enum: Object.values(EnumType)`.
6. Reference: `type: Schema.Types.ObjectId, ref: 'ModelName'`.

### Danh sách schemas cần tạo

| File                      | Model Name     | Các field đặc biệt                                                                                                                                                                    |
| ------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `user.schema.ts`          | `User`         | `clerkId`, `username` (unique), `email` (unique), `role`, `status`                                                                                                                    |
| `category.schema.ts`      | `Category`     | `title`, `slug` (unique), `description`, `status`, `_destroy`                                                                                                                         |
| `product.schema.ts`       | `Product`      | `title`, `slug` (unique), `sku` (unique), `price`, `cost`, `quantity`, `minQuantity` (default 5), `category` (ref Category), `author` (ref User), `image`, `status`, `_destroy`       |
| `stock-history.schema.ts` | `StockHistory` | `product` (ref Product, required), `action` (enum StockAction, required), `quantity` (required), `previousQuantity` (required), `newQuantity` (required), `note`, `author` (ref User) |

---

## Bước 6: Shared - Hooks & Stores

### 6.1 `useQueryString` hook (`src/shared/hooks/use-query-string.tsx`)

- `"use client"` ở đầu.
- Dùng `useSearchParams`, `useRouter`, `usePathname` từ `next/navigation`.
- Dùng `debounce` từ `lodash` cho search (250ms).
- Export: `currentPage`, `handleChangePage`, `handleSearchData`, `handleSelectStatus`, `handleChangeQs`.
- Logic: tạo `URLSearchParams`, set/delete param, push router (scroll: false).

### 6.2 Zustand store (`src/shared/stores/app-store.ts`)

```typescript
interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}
```

---

## Bước 7: Shared - UI Components

Tất cả trong `src/shared/components/ui/`. Sử dụng Tailwind utility classes, icons từ `lucide-react`.

### 7.1 `Pagination`

- Props: `currentPage`, `totalPages`, `onPageChange`.
- Hiển thị page numbers với ellipsis (...) khi nhiều trang.
- Nút Previous/Next với disabled state.

### 7.2 `StatusBadge`

- Props: `status: string`, `variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'`.
- Tự map status → variant (ACTIVE=success, INACTIVE=default, OUT_OF_STOCK=danger, IN=success, OUT=danger, ADJUSTMENT=info).
- Hiển thị dưới dạng rounded pill badge.

### 7.3 `StatCard`

- Props: `title`, `value`, `icon: LucideIcon`, `description?`, `className?`.
- Card với icon bên phải, value lớn bên trái.

### 7.4 `EmptyState`

- Props: `title?`, `description?`.
- Hiển thị icon Package + text khi không có data.

### 7.5 `ConfirmDialog`

- Props: `open`, `title`, `description`, `onConfirm`, `onCancel`, `loading?`.
- Modal overlay với nút Cancel + Delete (màu đỏ).
- Dùng cho xác nhận xóa.

---

## Bước 8: Shared - Layout Components

### 8.1 `Sidebar` (`src/shared/components/layouts/sidebar.tsx`)

- `"use client"` — dùng Zustand store `useAppStore`.
- Menu items: Dashboard (`/dashboard`), Products (`/manage/products`), Categories (`/manage/categories`).
- Mỗi item có icon từ lucide-react.
- Active state highlight bằng `pathname.startsWith(item.href)`.
- Collapsible: width 64 (mở) / 20 (đóng), toggle button.
- Logo: icon `Warehouse` + text "IMS".
- Fixed position left, full height.

### 8.2 `Header` (`src/shared/components/layouts/header.tsx`)

- `"use client"` — dùng Clerk `<UserButton>`, `<SignedIn>`.
- Sticky top, nút toggle sidebar (mobile), UserButton bên phải.
- Prop `title?` hiển thị page title.

---

## Bước 9: Clerk Authentication Setup

### 9.1 Middleware / Proxy (`src/proxy.ts`)

> **LƯU Ý:** Next.js 16 đổi convention từ `middleware.ts` sang `proxy.ts`. Nếu dự án dùng `src/` thì file PHẢI ở `src/proxy.ts`.

```typescript
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### 9.2 Root Layout (`src/app/layout.tsx`)

- Import `ClerkProvider` từ `@clerk/nextjs`.
- Wrap toàn bộ `<html>` trong `<ClerkProvider>`.
- Metadata: title "IMS - Inventory Management System".

### 9.3 Auth Pages

- `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` — render `<SignIn />` từ `@clerk/nextjs`, centered.
- `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` — render `<SignUp />` từ `@clerk/nextjs`, centered.

### 9.4 Lấy role (nếu cần)

```typescript
// Đúng — dùng currentUser
import { currentUser } from "@clerk/nextjs/server";
const user = await currentUser();
const role = (user?.publicMetadata?.role as string) ?? "user";

// Sai — sessionClaims.metadata.role sẽ undefined nếu chưa customize session token
```

---

## Bước 10: Module Category

### 10.1 Server Actions (`src/modules/category/actions/category.actions.ts`)

Đầu file: `"use server"`.

| Action               | Mô tả                                                            |
| -------------------- | ---------------------------------------------------------------- |
| `createCategory`     | Check slug trùng → `CategoryModel.create` → `revalidatePath`     |
| `fetchCategories`    | Phân trang + search + filter status, trả `{ categories, total }` |
| `fetchAllCategories` | Lấy tất cả active categories (cho dropdown), sort by title       |
| `getCategoryBySlug`  | Lấy 1 category theo slug, filter `_destroy: false`               |
| `updateCategory`     | Find by slug → `findOneAndUpdate` → `revalidatePath`             |
| `deleteCategory`     | Soft delete: `findOneAndUpdate({ slug }, { _destroy: true })`    |

**Lưu ý:** Mongoose 9 không còn export `FilterQuery`. Dùng `Record<string, any>` cho query object.

### 10.2 Components

**`CategoryTable`** — Client component:
- Toolbar: input search (dùng `handleSearchData`), select filter status.
- Table: columns = Category (icon + title), Slug, Description, Status (StatusBadge), Created, Actions (Edit + Delete buttons).
- Pagination bar ở footer table.
- `ConfirmDialog` cho xác nhận xóa.
- Props: `categories`, `total`, `onEdit` callback.

**`CategoryFormDialog`** — Client component:
- Modal dialog với form: title, slug (auto-generate từ title bằng `slugify`, disabled khi edit), description, status (chỉ hiện khi edit).
- `useEffect` reset form khi `category` hoặc `open` thay đổi.
- Submit: gọi `createCategory` hoặc `updateCategory`.
- **LƯU Ý:** Khi updateCategory, cast `formData as any` để tránh lỗi type `status: string` vs `CategoryStatus`.

**`CategoryPageClient`** — Client wrapper:
- State quản lý dialog open/close và edit category.
- Render header + nút "Add Category" + `CategoryTable` + `CategoryFormDialog`.

---

## Bước 11: Module Product

### 11.1 Server Actions (`src/modules/product/actions/product.actions.ts`)

| Action             | Mô tả                                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| `createProduct`    | Check slug + SKU trùng → omit empty author → `ProductModel.create` → tạo StockHistory nếu quantity > 0   |
| `fetchProducts`    | Phân trang + search (title + sku) + filter status, populate author + category, trả `{ products, total }` |
| `getProductBySlug` | Lấy 1 product, populate author + category                                                                |
| `updateProduct`    | Nếu quantity thay đổi → tạo StockHistory → `findOneAndUpdate`                                            |
| `deleteProduct`    | Soft delete                                                                                              |
| `updateStock`      | Nhận action (IN/OUT/ADJUSTMENT) + quantity → tính newQuantity → tạo StockHistory → update product        |

**Bug quan trọng đã sửa:**
- `author` có thể là `""` (user Clerk chưa sync vào MongoDB). Nếu truyền `""` vào field ObjectId, Mongoose sẽ throw `BSONError`.
- **Fix:** Tách `author` ra khỏi params, chỉ include khi `author && author.trim()` có giá trị.

```typescript
const { author, ...rest } = params;
const createPayload = {
  ...rest,
  ...(author && author.trim() ? { author } : {}),
};
const product = await ProductModel.create(createPayload);
```

### 11.2 Components

**`ProductTable`** — Client component:
- Toolbar: search input, status filter select, nút "Add Product" (Link to `/manage/products/create`).
- Table columns: Product (icon + title + slug), SKU (monospace), Category, Price (formatted USD), Quantity (highlight đỏ nếu <= minQuantity, badge "Low stock"), Status (StatusBadge), Actions (Edit link + Delete button).
- Pagination footer với "Showing X to Y of Z results".
- `ConfirmDialog` cho xóa.
- Dùng `String(product._id)` cho React key.

**`ProductForm`** — Client component:
- Props: `product?` (edit mode), `categories`, `authorId`.
- 3 section cards: Basic Information (title, slug, sku, description), Pricing & Stock (price, cost, quantity, minQuantity), Organization (category select, status select, image URL).
- Auto-generate slug từ title bằng `slugify` (chỉ khi tạo mới).
- Number fields convert qua `Number(value)` trong handleChange.
- Submit: `createProduct` hoặc `updateProduct`.
- **LƯU Ý:** `product.category._id` phải `.toString()` khi set vào state. Select value dùng `String(formData.category)`. Category options dùng `String(cat._id)` cho key và value.
- **LƯU Ý:** Khi updateProduct, cast `formData as any` để bypass type mismatch.

---

## Bước 12: Module Dashboard

### Server Actions (`src/modules/dashboard/actions/dashboard.actions.ts`)

| Action                | Mô tả                                                                          |
| --------------------- | ------------------------------------------------------------------------------ |
| `getDashboardStats`   | `Promise.all` count 4 metrics + tính totalInventoryValue (sum price*qty)       |
| `getRecentProducts`   | 5 sản phẩm mới nhất, populate category                                         |
| `getLowStockProducts` | Sản phẩm có quantity <= minQuantity, dùng `$expr`, sort quantity asc, limit 10 |

**Low stock query dùng `$expr`:**

```typescript
ProductModel.countDocuments({
  _destroy: false,
  $expr: {
    $and: [
      { $lte: ["$quantity", "$minQuantity"] },
      { $gt: ["$quantity", 0] },
    ],
  },
})
```

---

## Bước 13: App Router - Pages & Routes

### 13.1 Tất cả page trong `(dashboard)/` phải có `export const dynamic = "force-dynamic"`

Vì các page gọi DB và Clerk auth, không thể static render lúc build.

### 13.2 Dashboard Layout (`src/app/(dashboard)/layout.tsx`)

- Server component, dùng `auth()` từ `@clerk/nextjs/server` (phải `await`).
- Nếu không có `userId` → `redirect("/sign-in")`.
- Render `<Sidebar />` + `<Header />` + `{children}`.
- Sidebar fixed left, main content có `ml-20 lg:ml-64` (responsive với sidebar state).

### 13.3 Dashboard Page

- Server component, gọi 3 actions song song: `getDashboardStats`, `getRecentProducts`, `getLowStockProducts`.
- **QUAN TRỌNG:** Không thể truyền React components (như Lucide icons) trực tiếp từ Server Component sang Client Component.
- **Giải pháp:** Tạo client component wrapper `DashboardStats` để render StatCards với icons.
- File: `src/app/(dashboard)/dashboard/components/dashboard-stats.tsx` — client component nhận `stats` data và render StatCards với icons.
- 2 cards grid: Recent Products list + Low Stock Alerts list.

### 13.4 Products Page (`/manage/products`)

- Server component, nhận `searchParams` (phải `await` trong Next.js 16).
- Gọi `fetchProducts` với params từ URL.
- Render `<ProductTable>` wrapped trong `<Suspense>`.

### 13.5 Create Product Page (`/manage/products/create`)

- Server component, check auth.
- Lấy MongoDB user từ Clerk userId: `UserModel.findOne({ clerkId: userId })`.
- Lấy categories: `fetchAllCategories()`.
- Render `<ProductForm>` với `categories` và `authorId`.

### 13.6 Edit Product Page (`/manage/products/edit/[slug]`)

- Server component, nhận `params.slug` (phải `await` trong Next.js 16).
- Lấy product + categories song song.
- Nếu product null → `notFound()`.
- Render `<ProductForm>` với `product`, `categories`, `authorId`.

### 13.7 Categories Page (`/manage/categories`)

- Server component, gọi `fetchCategories`.
- Render `<CategoryPageClient>` (client wrapper quản lý dialog state).

### 13.8 Landing Page (`src/app/page.tsx`)

- Dùng Clerk components: `<SignedIn>`, `<SignedOut>`, `<SignInButton>`, `<SignUpButton>`.
- Header: logo + auth buttons.
- Hero section: title + description + CTA.
- Features grid: 3 cards (Product Management, Category Organization, Real-time Insights).
- Footer.

---

## Bước 14: Lưu ý quan trọng & Bug đã sửa

### 14.1 Mongoose 9 breaking changes

| Vấn đề                                                     | Giải pháp                                        |
| ---------------------------------------------------------- | ------------------------------------------------ |
| `FilterQuery` không còn export từ `mongoose`               | Dùng `Record<string, any>` cho query object      |
| `_id` trong interface extends `Document` gây conflict type | **KHÔNG** khai báo `_id: string` trong interface |
| `ObjectId` không assign được cho React `key` prop          | Dùng `String(item._id)`                          |
| `ObjectId` không assign được cho HTML `value` attribute    | Dùng `String(value)` hoặc `.toString()`          |

### 14.2 Empty ObjectId bug

Khi truyền `""` vào field `Schema.Types.ObjectId`, Mongoose throw `BSONError: input must be a 24 character hex string`.

**Fix:** Kiểm tra string không rỗng trước khi include vào payload:

```typescript
const { author, ...rest } = params;
const payload = {
  ...rest,
  ...(author && author.trim() ? { author } : {}),
};
```

### 14.3 Next.js 16 conventions

| Thay đổi                     | Chi tiết                                        |
| ---------------------------- | ----------------------------------------------- |
| `middleware.ts` → `proxy.ts` | Next.js 16 deprecate "middleware", dùng "proxy" |
| `searchParams` là `Promise`  | Phải `await searchParams` trong page components |
| `params` là `Promise`        | Phải `await params` trong dynamic route pages   |

### 14.4 Clerk với Next.js 16

- `auth()` phải `await`: `const { userId } = await auth()`.
- Import `auth`, `currentUser` từ `@clerk/nextjs/server`.
- Import components (`ClerkProvider`, `SignInButton`, ...) từ `@clerk/nextjs`.
- Đặt proxy.ts ở `src/proxy.ts` khi dùng `src/` directory.

### 14.5 Passing React Components from Server to Client (CRITICAL BUG)

**Vấn đề:** Không thể truyền React components (functions) từ Server Component sang Client Component.

**Error:**
```
Only plain objects can be passed to Client Components from Server Components. Classes or other objects with methods are not supported.
Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server".
```

**Nguyên nhân:** Khi Server Component truyền icon component (như `Package` từ `lucide-react`) vào Client Component `StatCard`, Next.js không thể serialize function.

**Giải pháp:** Tạo client component wrapper để render icons bên trong client component.

**Ví dụ sai:**
```tsx
// ❌ Server Component
import { Package } from "lucide-react";
import { StatCard } from "@/shared/components/ui"; // Client component

export default async function DashboardPage() {
  return <StatCard icon={Package} />; // Error: Cannot pass function
}
```

**Ví dụ đúng:**
```tsx
// ✅ Server Component
import { DashboardStats } from "./components/dashboard-stats";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  return <DashboardStats stats={stats} />;
}

// ✅ Client Component: src/app/(dashboard)/dashboard/components/dashboard-stats.tsx
"use client";
import { Package } from "lucide-react";
import { StatCard } from "@/shared/components/ui";

export function DashboardStats({ stats }: { stats: DashboardStatsType }) {
  return <StatCard icon={Package} />; // OK: icons imported in client component
}
```

**Quy tắc:**
- Icons/components phải được import và sử dụng trong cùng client component.
- Server Component chỉ truyền plain data (strings, numbers, objects, arrays).
- Nếu cần render icons trong Server Component → tạo client component wrapper.

### 14.6 Thứ tự tạo file khuyến nghị

1. Libs & constants trước (không phụ thuộc gì).
2. Types → Schemas (types cần constants, schemas cần types).
3. Hooks & Stores (cần constants).
4. UI components (không phụ thuộc business logic).
5. Layout components (cần stores, Clerk).
6. Module actions (cần libs, schemas, types).
7. Module components (cần actions, hooks, UI components).
8. App pages (cần modules, layouts).

---

## Checklist tổng hợp

- [ ] Scaffold Next.js + cài dependencies
- [ ] Tạo `.env.example` và `.gitignore`
- [ ] Tạo `globals.css` với CSS variables + Tailwind theme
- [ ] Tạo `src/shared/libs/mongoose.ts` (singleton connection)
- [ ] Tạo `src/shared/constants/` (enums + app constants)
- [ ] Tạo `src/shared/types/` (models + app types + params + common)
- [ ] Tạo `src/shared/schemas/` (User, Product, Category, StockHistory)
- [ ] Tạo `src/shared/hooks/use-query-string.tsx`
- [ ] Tạo `src/shared/stores/app-store.ts` (Zustand)
- [ ] Tạo `src/shared/components/ui/` (Pagination, StatusBadge, StatCard, EmptyState, ConfirmDialog)
- [ ] Tạo `src/shared/components/layouts/` (Sidebar, Header)
- [ ] Tạo `src/proxy.ts` (Clerk middleware)
- [ ] Tạo `src/app/layout.tsx` (ClerkProvider)
- [ ] Tạo auth pages (sign-in, sign-up)
- [ ] Tạo `src/modules/category/` (actions + components)
- [ ] Tạo `src/modules/product/` (actions + components)
- [ ] Tạo `src/modules/dashboard/` (actions)
- [ ] Tạo `src/app/(dashboard)/layout.tsx` (protected layout)
- [ ] Tạo `src/app/(dashboard)/dashboard/components/dashboard-stats.tsx` (client wrapper cho StatCards với icons)
- [ ] Tạo tất cả route pages (dashboard, products, categories)
- [ ] Tạo landing page
- [ ] Chạy `npx tsc --noEmit` kiểm tra TypeScript
- [ ] Tạo `.env.local` với keys thật và test `npm run dev`
