## Context

Tất cả các trang admin hiện tại (`CatalogTable`, `ProductPage`, `ProductDetailPage`) đã có **danh sách + thêm + sửa + xóa**. Vấn đề:
1. **Không có màn xem chi tiết** — admin không thể kiểm tra nhanh thông tin đầy đủ của một mục mà không bấm "Sửa"
2. **Form sửa dùng cache list** — khi mở form sửa, dữ liệu được lấy từ item trong bộ nhớ React Query, không gọi API lại → nếu người admin khác vừa sửa, form sẽ hiển thị thông tin cũ
3. **Backend không có GET /{id}** — không có endpoint lấy chi tiết theo ID riêng lẻ cho bất kỳ resource nào

## Goals / Non-Goals

**Goals:**
- Thêm action "Xem chi tiết" (icon mắt) vào tất cả trang admin → mở Drawer read-only
- Khi mở form sửa: `invalidate` + `refetch` query danh sách → lấy item mới nhất theo ID
- Không thay đổi cấu trúc component tổng thể, không tạo thêm service mới

**Non-Goals:**
- Không thêm endpoint `GET /api/admin/*/{id}` vào backend
- Không thêm chức năng search/filter mới
- Không refactor lại service layer

## Decisions

### Chiến lược "Gọi API khi mở form"

**Quyết định**: Khi admin bấm "Sửa" hoặc "Xem chi tiết", gọi `queryClient.fetchQuery` (không phải `invalidateQueries`) để đảm bảo có dữ liệu mới nhất đồng bộ trước khi mở modal/drawer.

```ts
const handleOpenEdit = async (id: string) => {
  setLoadingId(id)
  const fresh = await queryClient.fetchQuery({ queryKey: [queryKey], queryFn: fetchFn, staleTime: 0 })
  const item = fresh.data.find(i => i.id === id)
  form.setFieldsValue(item)
  setEditing(item)
  setOpen(true)
  setLoadingId(null)
}
```

**Lý do chọn `fetchQuery` thay vì `invalidateQueries`**: `fetchQuery` là synchronous-like, trả về dữ liệu ngay khi resolve, cho phép lấy item trước khi mở modal. `invalidateQueries` chỉ đánh dấu stale và re-render async — không đủ để chắc chắn có fresh data trước khi form mở.

### Pattern "Xem chi tiết" bằng Drawer

**Quyết định**: Dùng Ant Design `Drawer` (width=480) thay vì Modal cho detail view.

**Lý do**: Drawer phù hợp với nhiều field hơn (product-detail có ảnh, mô tả, giá...) và không che khuất danh sách phía sau. Modal phù hợp hơn cho form edit (tập trung).

### CatalogTable — không thêm prop mới

**Quyết định**: Thêm detail drawer trực tiếp vào `CatalogTable` component (`CatalogItem` chỉ có `id` + `name`), không cần prop callback từ bên ngoài.

**Lý do**: Catalog items chỉ có 2 trường, detail view đủ đơn giản để xử lý nội bộ. Tránh breaking change ở 4 trang catalog đang dùng.

### Loading state khi fetch trước khi mở

**Quyết định**: Dùng local state `loadingId: string | null` — khi đang fetch, nút Edit/View của row đó hiển thị `loading={true}`, nút các row khác vẫn hoạt động bình thường.

## Risks / Trade-offs

- **Fetch toàn bộ list mỗi lần mở edit**: Với danh sách nhỏ (catalog items), không đáng kể. Với product-detail (nhiều mục + ảnh), có thể chậm hơn. → Mitigation: `staleTime: 0` chỉ áp dụng khi mở edit, list thường dùng `staleTime: 60_000`.
- **Race condition**: Nếu admin bấm Edit nhanh 2 lần, 2 fetch chạy song song. → Mitigation: Disable button khi `loadingId !== null`.

## Open Questions

- Không có open questions. Tất cả decisions đã rõ ràng dựa trên API hiện có.
