document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const rememberMeCheckbox = document.getElementById("rememberMe");

  // Kiểm tra xem thông tin đăng nhập có được lưu trong Local Storage không
  if (localStorage.getItem("rememberedUsername")) {
    usernameInput.value = localStorage.getItem("rememberedUsername");
    rememberMeCheckbox.checked = true; // Tích sẵn checkbox nếu đã lưu tài khoản
  }

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;
    const rememberMe = rememberMeCheckbox.checked;

    // Xử lý lưu tài khoản
    if (rememberMe) {
      localStorage.setItem("rememberedUsername", username); // Lưu username vào Local Storage
    } else {
      localStorage.removeItem("rememberedUsername"); // Xóa thông tin nếu người dùng bỏ chọn "Lưu tài khoản"
    }
    // Gửi yêu cầu đăng nhập tới backend (cần điều chỉnh theo API backend của bạn)
    fetch("https://nhadat-1.onrender.com/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Kiểm tra xem có trả về 'username' không
          showNotification("Đăng nhập thành công", "success");
          localStorage.setItem("username", username);
          setTimeout(() => {
            window.location.href = "/public/dashboard.html"; // Điều hướng về trang login sau khi đăng ký thành công
          }, 3000);
        } else {
          alert("Đăng nhập thất bại");
        }
      })
      .catch((error) => console.error("Error:", error));
  });
});

function showNotification(message, type) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.className = `${type} show`; // Thêm cả class 'show' và 'success' hoặc 'error'
  notification.style.right = "20px"; // Đặt lại vị trí để di chuyển vào màn hình

  // Ẩn thông báo sau 3 giây
  setTimeout(() => {
    notification.className = type; // Xóa lớp 'show' để ẩn thông báo
    notification.style.right = "-300px"; // Di chuyển ra khỏi màn hình
  }, 3000);
}
