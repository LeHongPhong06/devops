Đầu tiên cài đặt nginx và ssh server -> sudo apt update && sudo install -y nginx openssh-server
Tạo biến STATUS gián giá trị để check dịch vụ trong vòng lặp có hoạt động hay không -> STATUS=$(systemctl is-active "$service")
So sánh STATUS với chuỗi "active"/"inactive" tương ứng với "Hoạt động"/"Không hoạt động" -> [ "$STATUS" == "active" ]
Ở đây em dùng so sánh thủ công, có cách nào khác hay hơn mong anh chỉa sẻ thêm
In chữ màu xanh/đỏ em có search nhưng không hiểu lắm @@ anh cũng chia sẻ thêm phần này cho bọn em với ạ

