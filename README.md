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
EXPO_PUBLIC_API_URL=http://192.168.1.10:8000/api
```

Không dùng `localhost` khi chạy app trên điện thoại thật. Khởi động backend bằng `php artisan serve --host=0.0.0.0 --port=8000`, sau khi đã chạy `composer install` và `php artisan migrate`. Khởi động lại Expo khi thay `.env`. Nếu dùng web trên cùng máy, có thể đặt URL thành `http://localhost:8000/api`.

Android native builds cần được tạo lại sau khi thêm config plugin cho HTTP cleartext. Plugin này cho phép app tải API và ảnh bìa qua HTTP trong môi trường LAN; dùng HTTPS cho môi trường triển khai.

Đăng ký, đăng nhập, đăng xuất và khôi phục tài khoản dùng API Laravel qua hook `src/hooks/use-auth.tsx`. Form hiển thị lỗi validation từ API; đăng ký yêu cầu mật khẩu tối thiểu 8 ký tự và xác nhận mật khẩu. Tài khoản mới có vai trò `reader`. Trên backend, dùng `php artisan users:set-role <email> admin` để cấp quyền quản trị rồi đăng nhập lại; mục **Quản lý sách** xuất hiện trong màn Cá nhân cho admin.

Token được lưu bằng Expo SecureStore trên Android/iOS, xác minh qua `/api/me` khi mở app và xóa khi đăng xuất hoặc nhận HTTP 401. Trên web token chỉ giữ trong bộ nhớ; tải lại trang cần đăng nhập lại. Khi khôi phục phiên gặp lỗi mạng, app hiển thị lỗi và giữ token đã lưu để thử lại lần mở app sau. Đăng xuất cần kết nối mạng để thu hồi token trên máy chủ. Dùng HTTPS ở môi trường triển khai.

Các màn đọc sách/thư viện vẫn dùng dữ liệu mẫu; màn quản lý sách dùng API thật và tự đính kèm token. Quyền ghi sách được kiểm tra ở backend.

## Các luồng đã có

- Home, tìm kiếm theo tên sách hoặc tác giả (có/không dấu), lọc chủ đề, thư viện và hồ sơ.
- Chi tiết sách, danh sách chương và trạng thái yêu thích.
- Reader, chuyển chương, tùy chỉnh cỡ chữ, light/sepia/dark theme.
- Bookmark, lưu tiến độ trong phiên làm việc.
- AI Voice Player tương tác với play/pause, tua và tốc độ.
- Đăng nhập, đăng ký, đăng xuất qua API và phân quyền màn quản trị.

## Kiểm tra mã nguồn

```powershell
pnpm test
pnpm run lint
npx tsc --noEmit
```
