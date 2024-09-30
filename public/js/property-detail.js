document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = urlParams.get("id");

  if (propertyId) {
    // Gửi yêu cầu tới server để lấy chi tiết của bất động sản
    fetch(`http://localhost:3000/api/properties/${propertyId}`)
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("id").value = data.id;
        document.getElementById("status").value = data.status;
        document.getElementById("type").value = data.type;
        document.getElementById("location").value = data.location;
        document.getElementById("house-number").value = data.house_number;
        document.getElementById("street").value = data.street;
        document.getElementById("ward").value = data.ward;
        document.getElementById("district").value = data.district;
        document.getElementById("width").value = data.width;
        document.getElementById("length").value = data.length;
        document.getElementById("structure").value = data.structure;
        document.getElementById("tn").value = data.tn;
        document.getElementById("rent").value = data.rent;
        document.getElementById("area").value = data.area;
        document.getElementById("notes").value = data.notes;
        // Gán các giá trị khác vào form
      })
      .catch((error) => console.error("Lỗi khi lấy dữ liệu:", error));
  }

  // Sự kiện lưu thay đổi
  document.getElementById("saveBtn").addEventListener("click", () => {
    const updatedProperty = {
      status: document.getElementById("status").value,
      type: document.getElementById("type").value,
      location: document.getElementById("location").value,
      house_number: document.getElementById("house-number").value,
      street: document.getElementById("street").value,
      ward: document.getElementById("ward").value,
      district: document.getElementById("district").value,
      width: document.getElementById("width").value,
      length: document.getElementById("length").value,
      structure: document.getElementById("structure").value,
      tn: document.getElementById("tn").value,
      rent: document.getElementById("rent").value,
      area: document.getElementById("area").value,
      notes: document.getElementById("notes").value,
      // Lấy các giá trị khác từ form
    };

    fetch(`http://localhost:3000/api/properties/${propertyId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProperty),
    })
      .then((response) => response.json())
      .then((data) => {
        alert("Cập nhật thành công!");
        window.location.href = "dashboard.html"; // Quay lại trang dashboard
      })
      .catch((error) => console.error("Lỗi khi cập nhật:", error));
  });

  // Sự kiện xóa
  document.getElementById("deleteBtn").addEventListener("click", () => {
    if (confirm("Bạn có chắc chắn muốn xóa bất động sản này?")) {
      fetch(`http://localhost:3000/api/properties/${propertyId}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          alert("Xóa thành công!");
          window.location.href = "dashboard.html"; // Quay lại trang dashboard
        })
        .catch((error) => console.error("Lỗi khi xóa:", error));
    }
  });
});

document.getElementById("cancelBtn").addEventListener("click", ()=>{
  window.location.href = "dashboard.html"; // Quay lại trang dashboard
})

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
