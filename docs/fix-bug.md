1. Mục 6 — Cập nhật JSON response mẫu cho ProductResponse và ProductDetailResponse để phản ánh đúng các trường mới:
ProductResponse: thêm brandId, marterialId vào JSON mẫu
ProductDetailResponse: thêm productId, sizeId, colorId vào JSON mẫu
2. Mục 4 — Cập nhật JSON mẫu trong phần User Orders, productDetailResponses giờ có thêm productId, sizeId, colorId.
3. Mục 7 (mới) — Gio hang (Cart): Tài liệu đầy đủ cho API DELETE /remove-product-from-cart/{cartDetailId} bao gồm path param, header, response, error cases, và logic xử lý.
4. Mục 9 (mới) — Changelog: Ghi lại chi tiết 2 thay đổi gần đây:
Thêm ID vào DTO response: bảng so sánh trước/sau, danh sách file thay đổi, danh sách tất cả endpoint bị ảnh hưởng, ghi chú không breaking change
Thêm API xóa sản phẩm khỏi giỏ hàng: mô tả vấn đề, giải pháp, file thay đổi