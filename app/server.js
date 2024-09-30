const express = require("express");
const session = require("express-session");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const XLSX = require("xlsx");
const fs = require("fs");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
const upload = multer({ dest: "uploads/" });

app.use(
  session({
    secret: "123456",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Connect to MySQL
const db = mysql.createConnection({
  host: "qk4.h.filess.io",
  user: "nhadat_markenter",
  password: "abef804daf0924ff4faadc003b1a74e4925837ec",
  database: "nhadat_markenter",
  port: 3307,
  connectTimeout: 10000,
});

db.connect((err) => {
  if (err) {
    console.log("MySQL connection error:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

// Login API
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    }
  );
});

// Register API
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  db.query(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, password],
    (err, result) => {
      if (err) {
        res.json({ success: false });
      } else {
        res.json({ success: true });
      }
    }
  );
});

// Endpoint kiểm tra trùng username
app.post("/check-username", (req, res) => {
  const { username } = req.body;
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) {
        res.status(500).json({ success: false, message: "Lỗi server" });
        return;
      }
      if (results.length > 0) {
        res.json({ success: false, message: "Username đã tồn tại" });
      } else {
        res.json({ success: true });
      }
    }
  );
});

// Endpoint lấy danh sách nhà đất
app.get("/api/properties", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search ? `%${req.query.search}%` : "%";
  const offset = (page - 1) * limit;

  // Câu truy vấn để tính tổng số bản ghi dựa trên tìm kiếm
  const countSql = `
      SELECT COUNT(*) AS total 
      FROM properties
      WHERE house_number LIKE ? 
         OR street LIKE ?
         OR ward LIKE ?
         OR district LIKE ?
  `;

  // Thực thi câu truy vấn tính tổng số bản ghi
  db.query(countSql, [search, search, search, search], (err, result) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, message: "Error fetching total count." });
    }

    const total = result[0].total;
    const totalPages = Math.ceil(total / limit);

    // Câu truy vấn lấy dữ liệu, có tìm kiếm
    const dataSql = `
          SELECT * 
          FROM properties 
          WHERE house_number LIKE ? 
             OR street LIKE ?
             OR ward LIKE ?
             OR district LIKE ?
          ORDER BY id DESC 
          LIMIT ? OFFSET ?
      `;

    // Thực thi câu truy vấn lấy dữ liệu
    db.query(
      dataSql,
      [search, search, search, search, limit, offset],
      (err, results) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ success: false, message: "Error fetching data." });
        }

        // Trả về dữ liệu kèm tổng số trang
        res.json({ success: true, data: results, totalPages });
      }
    );
  });
});

// Endpoint để xử lý tệp Excel
app.post("/api/import-excel", upload.single("file"), (req, res) => {
  const file = req.file;

  if (!file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded." });
  }

  // Đọc tệp Excel
  const workbook = XLSX.readFile(file.path);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  // Xử lý dữ liệu và chèn vào cơ sở dữ liệu
  const sql = `INSERT INTO properties (status, type, location, house_number, street, ward, district, width, length, structure, tn, rent, area, notes) VALUES ?`;

  const values = data.map((row) => [
    row["Tình Trạng"],
    row["Phân Loại"],
    row["Vị Trí"],
    row["Số Nhà"],
    row["Đường"],
    row["Phường"],
    row["Quận"],
    row["Ngang"],
    row["Dài"],
    row["Kết Cấu"],
    row["TM"] === "Có",
    row["Giá Thuê"],
    row["Diện Tích"],
    row["Ghi Chú"],
  ]);

  db.query(sql, [values], (err) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, message: "Error importing data." });
    }

    // Xóa tệp tạm sau khi xử lý
    fs.unlink(file.path, (err) => {
      if (err) console.error("Error deleting file:", err);
    });

    res.json({ success: true, message: "Data imported successfully!" });
  });
});

// API để lấy tổng số trang
app.get("/api/properties/total", (req, res) => {
  const limit = 10; // Giới hạn số bản ghi trên mỗi trang

  db.query("SELECT COUNT(*) AS count FROM properties", (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
      return;
    }

    const totalRecords = results[0].count;
    const totalPages = Math.ceil(totalRecords / limit);

    res.json({ success: true, totalPages: totalPages });
  });
});

// API thêm bất động sản
app.post("/api/properties/add", (req, res) => {
  const {
    status,
    type,
    location,
    house_number,
    street,
    ward,
    district,
    width,
    length,
    structure,
    tn,
    rent,
    area,
    notes,
  } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (
    !status ||
    !type ||
    !location ||
    !house_number ||
    !street ||
    !ward ||
    !district ||
    !width ||
    !length ||
    !structure ||
    !tn ||
    !rent ||
    !area
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu thông tin bắt buộc" });
  }

  // Thực hiện truy vấn SQL để chèn dữ liệu
  const query = `
        INSERT INTO properties (status, type, location, house_number, street, ward, district, width, length, structure, tn, rent, area, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  db.query(
    query,
    [
      status,
      type,
      location,
      house_number,
      street,
      ward,
      district,
      width,
      length,
      structure,
      tn,
      rent,
      area,
      notes,
    ],
    (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        return res
          .status(500)
          .json({ success: false, message: "Lỗi khi thêm bất động sản" });
      }

      res.json({
        success: true,
        message: "Bất động sản đã được thêm thành công!",
      });
    }
  );
});

app.post("/api/logout", (req, res) => {
  // Xóa session hoặc cookie (tùy vào cách bạn lưu thông tin phiên làm việc)
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Không thể đăng xuất" });
    }

    res.clearCookie("session-id"); // Xóa cookie nếu sử dụng
    res.json({ success: true });
  });
});
// API lấy dữ chi tiết dữ liệu
app.get("/api/properties/:id", (req, res) => {
  const propertyId = req.params.id;
  const updatedProperty = req.body;

  // Cập nhật thông tin trong database
  db.query(
    "SELECT * FROM properties WHERE id = ?",
    [propertyId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Server error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Property not found" });
      }

      res.json(result[0]);
    }
  );
});

app.delete("/api/properties/:id", (req, res) => {
  const propertyId = req.params.id;

  // Xóa bất động sản khỏi database
  db.query(
    "DELETE FROM properties WHERE id = ?",
    [propertyId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Lỗi khi xóa dữ liệu" });
      }
      res.json({ success: true });
    }
  );
});

app.put("/api/properties/:id", (req, res) => {
  const propertyId = req.params.id;
  const updatedProperty = req.body;

  // Cập nhật thông tin trong database
  db.query(
    "UPDATE properties SET ? WHERE id = ?",
    [updatedProperty, propertyId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Lỗi khi cập nhật dữ liệu" });
      }
      res.json({ success: true });
    }
  );
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
