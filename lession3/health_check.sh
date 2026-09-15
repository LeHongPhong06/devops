services=("nginx" "ssh")
for service in "${services[@]}"; do
  STATUS=$(systemctl is-active $service)
  if [ $STATUS == "active" ]; then
	echo $service đang hoạt động
  else 
	echo $service đang dừng hoạt động
  fi
done

