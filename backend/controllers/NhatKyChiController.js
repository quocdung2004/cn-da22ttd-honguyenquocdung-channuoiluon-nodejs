const SpendingLog = require("../models/NhatKyChi"); // Import Model bạn vừa tạo

// 1. Tạo phiếu chi mới
exports.createSpendingLog = async (req, res) => {
  try {
    const { tankId, reason, totalCost, note, date } = req.body;

    const newLog = await SpendingLog.create({
      tankId,
      reason,
      totalCost,
      note,
      date: date || Date.now() // Nếu không chọn ngày thì lấy hiện tại
    });

    res.status(201).json({
      message: "Tạo phiếu chi thành công",
      data: newLog
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// 2. Lấy tất cả phiếu chi (Sắp xếp mới nhất trước)
exports.getAllSpendingLogs = async (req, res) => {
  try {
    const logs = await SpendingLog.find()
      .populate("tankId", "name") // Lấy tên bể để hiển thị
      .sort({ date: -1 }); // Mới nhất lên đầu

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Lấy phiếu chi theo ID Bể (Để tính tài chính cho từng bể)
exports.getSpendingLogsByTank = async (req, res) => {
  try {
    const { tankId } = req.params;
    
    const logs = await SpendingLog.find({ tankId })
      .sort({ date: -1 });

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Cập nhật phiếu chi
exports.updateSpendingLog = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedLog = await SpendingLog.findByIdAndUpdate(id, req.body, {
      new: true, // Trả về dữ liệu mới sau khi update
      runValidators: true // Kiểm tra lại các ràng buộc (ví dụ: tiền không được âm)
    });

    if (!updatedLog) {
      return res.status(404).json({ message: "Phiếu chi không tồn tại" });
    }

    res.status(200).json({
      message: "Cập nhật thành công",
      data: updatedLog
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Xóa phiếu chi
exports.deleteSpendingLog = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLog = await SpendingLog.findByIdAndDelete(id);

    if (!deletedLog) {
      return res.status(404).json({ message: "Phiếu chi không tồn tại" });
    }

    res.status(200).json({ message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};