const express = require("express");
const router = express.Router();
const {
  createSpendingLog,
  getAllSpendingLogs,
  getSpendingLogsByTank,
  updateSpendingLog,
  deleteSpendingLog
} = require("../controllers/NhatKyChiController"); // Nhớ trỏ đúng đường dẫn

const { protect } = require("../middleware/authMiddleware"); // Middleware bảo vệ (cần đăng nhập)

// Áp dụng bảo vệ cho tất cả các routes bên dưới
router.use(protect);

// 1. Lấy tất cả & Tạo mới
router.route("/")
  .get(getAllSpendingLogs) // GET /api/spending-logs
  .post(createSpendingLog); // POST /api/spending-logs

// 2. Lấy lịch sử chi THEO TỪNG BỂ (Đây là cái bạn cần)
// Gọi API: GET /api/spending-logs/tank/ID_CUA_BE
router.get("/tank/:tankId", getSpendingLogsByTank);

// 3. Sửa & Xóa theo ID phiếu chi
router.route("/:id")
  .put(updateSpendingLog)    // PUT /api/spending-logs/:id
  .delete(deleteSpendingLog); // DELETE /api/spending-logs/:id

module.exports = router;