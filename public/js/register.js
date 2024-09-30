document.getElementById("register-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;

    // Kiểm tra username trước khi đăng ký
    fetch("https://nhadat-1.onrender.com/check-username", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            showNotification(data.message, "error");
            return;
        }

        // Tiến hành đăng ký nếu username không bị trùng
        fetch("https://nhadat-1.onrender.com/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification("Đăng ký thành công", "success");
                setTimeout(() => {
                    window.location.href = "/nhadat/public/index.html";  // Điều hướng về trang login sau khi đăng ký thành công
                }, 3000);
            } else {
                showNotification("Đăng ký thất bại", "error");
            }
        });
    });
});

function showNotification(message, type) {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.className = `${type} show`; // Thêm cả class 'show' và 'success' hoặc 'error'
    notification.style.right = '20px'; // Đặt lại vị trí để di chuyển vào màn hình

    // Ẩn thông báo sau 3 giây
    setTimeout(() => {
        notification.className = type;  // Xóa lớp 'show' để ẩn thông báo
        notification.style.right = '-300px'; // Di chuyển ra khỏi màn hình
    }, 3000);
}
