## Chỉ có admin mới có quyền thêm sửa xoá, còn những role khác chỉ cho phép xem. Lấy role như sau:

```tsx
import { auth, currentUser } from "@clerk/nextjs/server";

const { sessionClaims } = await auth();
const user = await currentUser();
const role =
  (sessionClaims?.metadata as { role?: string })?.role ??
  (user?.publicMetadata?.role as string) ??
  UserRole.USER;
console.log("role", role);
const canEdit = role === UserRole.ADMIN;
```
