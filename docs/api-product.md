Tạo sản phẩm
{
  "name": "Áo sơ mi nam công sở",
  "image": "url_hinh_anh.jpg",
  "status": 1,
  "marterialId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "brandId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "productDetails": [
    {
      "name": "Áo sơ mi nam công sở trắng M",
      "description": "Mô tả chi tiết sản phẩm",
      "quantity": 100,
      "costPrice": 150000.0,
      "salePrice": 250000.0,
      "sizeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "colorId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "images": [
        "url_hinh_anh_chi_tiet.jpg"
      ]
    }
  ]
}
response
{
  "message": "tao moi thanh cong",
  "data": null,
  "timestamp": "2026-03-21T14:15:30.123"
}


Sửa sản phẩm
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6", 
  "name": "Áo sơ mi công sở (Update)",
  "image": "url_hinh_anh_moi.jpg",
  "status": 1,
  "marterialId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "brandId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  
  "productDetails": [
    // Truyền vào mảng này nếu muốn THÊM MỚI các chi tiết vào sản phẩm hiện tại
  ],
  
  "productDetailsUpdate": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6", 
      "name": "Áo sơ mi công sở trắng M",
      "description": "Cập nhật mô tả",
      "quantity": 150,
      "costPrice": 160000.0,
      "salePrice": 260000.0,
      "deleteFlag": false,
      "sizeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "colorId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "images": [
         "url_anh_moi.jpg"
      ],
      "imagesDelete": [
         "url_anh_can_xoa.jpg"
      ]
    }
  ]
}


response
{
  "message": "sua thanh cong",
  "data": null,
  "timestamp": "2026-03-21T14:20:01.444"
}


Lưu ý: 
- Chi khi bấm tạo mới / sửa thì gọi API  sản phẩm để tạo / sửa
- Thao tác tạo sửa trên kia chỉ là để hiển thị giao diện và lưu vào state tạm thời 
- Khi cập nhật sản phẩm -> thêm mới /cập nhật chi tiết (ở màn validate chi tiết đã có chưa ) -> click nút nếu bị trùng so với bản ghi chi tiết ở danh sách thì báo trùng
- Không cần phải sử dụng API thêm, sửa của product detail gì cả
