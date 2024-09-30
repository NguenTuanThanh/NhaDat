document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll(".sidebar a");
  const tabs = document.querySelectorAll(".tab-content");

  links.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();

      // Xóa lớp active khỏi tất cả các tab-content
      tabs.forEach((tab) => {
        tab.classList.remove("active");
      });

      // Thêm lớp active vào tab-content tương ứng
      const targetId = this.getAttribute("data-target");
      const targetTab = document.getElementById(targetId);
      if (targetTab) {
        targetTab.classList.add("active");
      }
    });
  });

  // Hiển thị tab mặc định khi tải trang (ví dụ: tab "Danh sách nhà đất")
  const defaultTab = document.getElementById("properties");
  if (defaultTab) {
    defaultTab.classList.add("active");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  loadPage(1);

  document.getElementById("next-page").addEventListener("click", () => {
    const currentPage =
      parseInt(document.getElementById("current-page").value) || 1;
    loadPage(currentPage + 1);
  });

  document.getElementById("prev-page").addEventListener("click", () => {
    const currentPage =
      parseInt(document.getElementById("current-page").value) || 1;
    if (currentPage > 1) {
      loadPage(currentPage - 1);
    }
  });
  document.getElementById("first-page").addEventListener("click", () => {
    loadPage(1);
  });

  document.getElementById("last-page").addEventListener("click", () => {
    // Tìm tổng số trang và chuyển đến trang cuối cùng
    fetch("https://nhadat-1.onrender.com/api/properties/total")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          loadPage(data.totalPages);
        } else {
          console.error("Failed to fetch total pages");
        }
      })
      .catch((error) => console.error("Error:", error));
  });
  document.getElementById("current-page").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const page = parseInt(e.target.value);
      if (!isNaN(page) && page > 0) {
        loadPage(page);
      }
    }
  });
  // Thêm sự kiện cho ô tìm kiếm
  document.getElementById("searchInput").addEventListener("input", () => {
    const query = document.getElementById("searchInput").value.trim();
    searchProperties(query);
  });
});

function loadPage(page = 1, limit = 10) {
  const query = document.getElementById("searchInput").value.trim();
  fetch(
    `https://nhadat-1.onrender.com/api/properties?page=${page}&limit=${limit}&search=${encodeURIComponent(
      query
    )}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        displayData(data.data, page, limit);
        document.getElementById("current-page").value = page;
        document.getElementById(
          "total-pages"
        ).textContent = `Tổng số trang: ${data.totalPages}`;
      } else {
        console.error("Failed to fetch data");
      }
    })
    .catch((error) => console.error("Error:", error));
}
function searchProperties(query) {
  loadPage(1); // Load first page with search query
}

function displayData(properties, page = 1, limit = 10) {
  const tableBody = document.getElementById("properties-table-body");
  if (!tableBody) {
    console.error("Table body element not found");
    return;
  }
  tableBody.innerHTML = ""; // Xóa nội dung cũ

  let startNumber = (page - 1) * limit + 1; // Tính số thứ tự bắt đầu

  properties.forEach((property, index) => {
    const row = document.createElement("tr");
    const note =
      property.notes.length > 50
        ? property.notes.substring(0, 50) + "..."
        : property.notes; // Giới hạn 50 ký tự
    row.dataset.id = property.id;
    row.innerHTML = `
            <td>${startNumber + index}</td>  <!-- Số thứ tự -->
            <td>${property.status}</td>
            <td>${property.type}</td>
            <td>${property.location}</td>
            <td>${property.house_number}</td>
            <td>${property.street}</td>
            <td>${property.ward}</td>
            <td>${property.district}</td>
            <td>${property.width}</td>
            <td>${property.length}</td>
            <td>${property.structure}</td>
            <td>${property.tn}</td>
            <td>${property.rent}</td>
            <td>${property.area}</td>
            <td title="${
              property.notes
            }">${note}</td> <!-- Hiển thị ghi chú ngắn hơn và tooltip chứa đầy đủ ghi chú -->
        `;
    row.addEventListener("click", () => {
      // Chuyển đến trang chi tiết với ID của dòng được chọn
      window.location.href = `property-detail.html?id=${property.id}`;
    });
    tableBody.appendChild(row);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.getElementById("logout");

  if (logoutButton) {
    logoutButton.addEventListener("click", (event) => {
      event.preventDefault(); // Ngăn chặn hành vi mặc định của liên kết
      const confirmation = confirm("Bạn có chắc chắn muốn đăng xuất?");
      if (confirmation) {
        // Nếu người dùng xác nhận, tiến hành đăng xuất
        fetch("https://nhadat-1.onrender.com/api/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              // Chuyển hướng về trang đăng nhập nếu đăng xuất thành công
              localStorage.removeItem("username");
              window.location.href = "/nhadat/public/index.html";
            } else {
              console.error("Lỗi đăng xuất:", data.message);
            }
          })
          .catch((error) => console.error("Error:", error));
      } else {
        window.location.href = "/nhadat/public/dashboard.html";
        console.log("Đăng xuất bị hủy.");
      }
    });
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const username = localStorage.getItem("username"); // Lấy dữ liệu từ localStorage
  const userGreeting = document.getElementById("userGreeting");
  // Kiểm tra nếu username tồn tại
  if (username) {
    userGreeting.textContent = `Hello, ${username}`; // Hiển thị tên người dùng
  } else {
    // Nếu không tìm thấy username, có thể chuyển hướng đến trang đăng nhập
    window.location.href = "/nhadat/public/index.html";
  }
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
// document.getElementById("toggle-filter").addEventListener("click", function () {
//   const filterSection = document.getElementById("filter-section");
//   if (
//     filterSection.style.display === "none" ||
//     filterSection.style.display === ""
//   ) {
//     filterSection.style.display = "block";
//   } else {
//     filterSection.style.display = "none";
//   }
// });

// document.getElementById("apply-filter").addEventListener("click", function () {
//   const priceRange = document.getElementById("price-range").value;
//   const district = document.getElementById("district").value;
//   const status = document.getElementById("status").value;
//   const category = document.getElementById("category").value;
//   const location = document.getElementById("location").value;

//   // Tạo chuỗi truy vấn
//   const query = `price=${priceRange}&district=${district}&status=${status}&category=${category}&location=${location}`;

//   // Gửi yêu cầu fetch tới API với các bộ lọc
//   fetch(`/api/properties?${query}`)
//     .then((response) => response.json())
//     .then((data) => {
//       if (data.success) {
//         // Hiển thị dữ liệu sau khi lọc
//         displayData(data.data);
//       } else {
//         console.error("Lọc dữ liệu thất bại");
//       }
//     })
//     .catch((error) => console.error("Error:", error));
// });
