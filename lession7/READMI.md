Ở đây em chia làm 3 subnet:

- 1 private subnet chứa 2 service: Order và Payment service
- 1 private subnet chứa 2 DB: Order DB và Payment DB
- 1 public subnet:
  - Có thể chứa thêm web app để bên ngoài internet truy cập đến
  - Internet Gateway cấu hình target cho Public route table
  - Bên trong sẽ có thêm 1 NAT Gateway để làm targe cho private route để các service order/payment service đi đường private route table lấy data ngoài internet
