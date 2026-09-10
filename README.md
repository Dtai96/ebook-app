# Mộc Thư Mobile

Front-end ứng dụng đọc sách điện tử cho Android và iOS, xây dựng bằng React Native, Expo SDK 57, TypeScript và Expo Router.

## Chạy trên điện thoại

1. Cài ứng dụng Expo Go trên điện thoại.
2. Đảm bảo điện thoại và máy tính cùng mạng Wi-Fi.
3. Mở terminal tại thư mục dự án và chạy:

   ```powershell
   pnpm start
   ```

4. Quét mã QR bằng Expo Go trên Android hoặc Camera trên iPhone.

Nếu kết nối LAN bị chặn, thử:

```powershell
pnpm start --tunnel
```

## Kết nối Laravel

Sao chép `.env.example` thành `.env` và thay địa chỉ IP LAN của máy chạy Laravel:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10/ebook-api/public/api
```

Không dùng `localhost` khi chạy app trên điện thoại thật. Front-end hiện sử dụng dữ liệu mẫu để có thể xem trọn vẹn giao diện trước khi backend hoàn tất; các hàm gọi API đã được đặt trong `src/services`.

## Các luồng đã có

- Home, tìm kiếm theo từ khóa/chủ đề, thư viện và hồ sơ.
- Chi tiết sách, danh sách chương và trạng thái yêu thích.
- Reader, chuyển chương, tùy chỉnh cỡ chữ, light/sepia/dark theme.
- Bookmark, lưu tiến độ trong phiên làm việc.
- AI Voice Player tương tác với play/pause, tua và tốc độ.
- Giao diện đăng nhập và đăng ký.

## Kiểm tra mã nguồn

```powershell
pnpm run lint
npx tsc --noEmit
```
