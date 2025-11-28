import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function SpendingLogManager() {
  // --- Cấu hình API ---
  const API_SPENDING = "http://localhost:5000/api/NhatKyChi";
  const API_TANK = "http://localhost:5000/api/tank";
  const token = localStorage.getItem("token");

  // --- State ---
  const [logs, setLogs] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(""); // create | edit | view | delete
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Form State
  const [form, setForm] = useState({
    tankId: "",
    reason: "",
    totalCost: "",
    note: "",
    date: new Date().toISOString().split('T')[0],
  });

  // --- Helpers ---
  const formatCurrency = (amount) => {
    return amount ? amount.toLocaleString('vi-VN') + ' VND' : '0 VND';
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split('T')[0];
  };

  // --- Handle Input ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === "totalCost") {
      processedValue = value === "" ? "" : Number(value);
    }

    setForm((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  // --- Fetch Data ---
  const fetchTanks = async () => {
    try {
      const res = await axios.get(API_TANK, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTanks(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách bể:", err);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_SPENDING, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data);
    } catch (err) {
      console.error("Lỗi lấy nhật ký chi:", err);
      alert("Lỗi khi tải dữ liệu nhật ký chi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTanks();
    fetchLogs();
  }, []);

  // --- Popup Logic ---
  const openPopup = (type, record = null) => {
    setPopupType(type);
    setSelectedRecord(record);

    if (record) {
      setForm({
        tankId: record.tankId?._id || record.tankId || "",
        reason: record.reason,
        totalCost: record.totalCost,
        note: record.note || "",
        date: formatDateForInput(record.date),
      });
    } else {
      setForm({
        tankId: "",
        reason: "",
        totalCost: "",
        note: "",
        date: new Date().toISOString().split('T')[0],
      });
    }
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupType("");
    setSelectedRecord(null);
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tankId) { alert("Vui lòng chọn bể nuôi"); return; }

    const dataToSend = { ...form, totalCost: Number(form.totalCost) };

    try {
      if (popupType === "edit") {
        await axios.put(`${API_SPENDING}/${selectedRecord._id}`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Cập nhật thành công");
      } else {
        await axios.post(API_SPENDING, dataToSend, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Thêm mới thành công");
      }
      fetchLogs();
      closePopup();
    } catch (err) {
      console.error("Lỗi API:", err);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  // --- Delete ---
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_SPENDING}/${selectedRecord._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Xóa thành công");
      fetchLogs();
      closePopup();
    } catch (err) {
      console.error("Lỗi xóa:", err);
      alert("Xóa thất bại");
    }
  };

  return (
    <Layout>
      <div className="p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">Nhật Ký Chi Phí</h1>
          <button
            onClick={() => openPopup("create")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Thêm Khoản Chi
          </button>
        </div>

        {/* TABLE */}
        {loading ? (
          <p className="text-center text-gray-600">Đang tải dữ liệu...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th className="py-3 px-4 text-center">STT</th>
                  <th className="py-3 px-4 text-center">Bể Nuôi</th> {/* Căn giữa */}
                  <th className="py-3 px-4 text-center">Lý do chi</th> {/* Căn giữa */}
                  <th className="py-3 px-4 text-center">Số tiền</th> {/* Tiêu đề căn giữa */}
                  <th className="py-3 px-4 text-center">Ngày chi</th>
                  <th className="py-3 px-4 text-center">Ghi chú</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={log._id} className="border-b hover:bg-gray-100">
                    <td className="py-3 px-4 text-center">{index + 1}</td>
                    <td className="py-3 px-4 text-center font-medium">{log.tankId?.name || '---'}</td>
                    <td className="py-3 px-4 text-center">{log.reason}</td>
                    
                    {/* Số tiền để căn phải (text-right) cho dễ đọc số liệu, nếu muốn căn giữa thì đổi thành text-center */}
                    <td className="py-3 px-4 text-right font-bold text-red-600">
                      {formatCurrency(log.totalCost)}
                    </td>
                    
                    <td className="py-3 px-4 text-center">{formatDateForDisplay(log.date)}</td>
                    <td className="py-3 px-4 text-left text-sm text-gray-600 max-w-xs truncate">{log.note || '---'}</td>
                    
                    {/* NÚT THAO TÁC CĂN GIỮA */}
                    <td className="py-3 px-4 flex justify-center gap-2">
                      <button
                        onClick={() => openPopup("view", log)}
                        className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                      >
                        Xem
                      </button>
                      <button
                        onClick={() => openPopup("edit", log)}
                        className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => openPopup("delete", log)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center p-4 text-gray-500">
                      Chưa có khoản chi nào được ghi nhận.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* POPUP */}
        {showPopup && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 backdrop-blur-sm z-50">
            <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl relative">
              
              {/* --- VIEW (MỚI) --- */}
              {popupType === "view" && selectedRecord && (
                <>
                  <h2 className="text-2xl font-bold mb-4 text-blue-600">Chi tiết Khoản Chi</h2>
                  <div className="space-y-3 text-gray-700">
                    <p><strong>Bể nuôi:</strong> {selectedRecord.tankId?.name}</p>
                    <p><strong>Lý do chi:</strong> {selectedRecord.reason}</p>
                    <p><strong>Số tiền:</strong> <span className="text-red-600 font-bold">{formatCurrency(selectedRecord.totalCost)}</span></p>
                    <p><strong>Ngày chi:</strong> {formatDateForDisplay(selectedRecord.date)}</p>
                    <p><strong>Ghi chú:</strong> {selectedRecord.note || "Không có"}</p>
                  </div>
                  <button 
                    onClick={closePopup} 
                    className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Đóng
                  </button>
                </>
              )}

              {/* --- CREATE / EDIT --- */}
              {(popupType === "create" || popupType === "edit") && (
                <>
                  <h2 className="text-2xl font-bold mb-4 text-blue-600">
                    {popupType === "create" ? "Thêm Khoản Chi Mới" : "Cập Nhật Khoản Chi"}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <select
                      name="tankId"
                      value={form.tankId}
                      onChange={handleChange}
                      className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
                      required
                    >
                      <option value="">-- Chọn bể nuôi cần chi --</option>
                      {tanks.map((t) => (
                        <option key={t._id} value={t._id}>{t.name} ({t.type})</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      name="reason"
                      placeholder="Lý do chi (VD: Sửa máy bơm...)"
                      value={form.reason}
                      onChange={handleChange}
                      className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
                      required
                    />

                    <input
                      type="number"
                      name="totalCost"
                      placeholder="Tổng chi phí (VNĐ)"
                      value={form.totalCost}
                      onChange={handleChange}
                      className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
                      required
                      min="0"
                    />

                    <div className="flex flex-col">
                        <label className="text-sm text-gray-600 mb-1">Ngày chi:</label>
                        <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
                        required
                        />
                    </div>

                    <textarea
                      name="note"
                      placeholder="Ghi chú thêm (Tùy chọn)"
                      rows="3"
                      value={form.note}
                      onChange={handleChange}
                      className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
                    />

                    <div className="flex space-x-3 pt-2">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        {popupType === "create" ? "Lưu lại" : "Cập nhật"}
                      </button>
                      <button
                        type="button"
                        onClick={closePopup}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* --- CONFIRM DELETE --- */}
              {popupType === "delete" && selectedRecord && (
                <>
                  <h2 className="text-2xl font-bold mb-4 text-red-600">Xóa khoản chi?</h2>
                  <p className="mb-4 text-gray-700">
                    Bạn có chắc muốn xóa khoản chi: <strong>{selectedRecord.reason}</strong> cho <strong>{selectedRecord.tankId?.name}</strong> với số tiền <strong>{formatCurrency(selectedRecord.totalCost)}</strong>?
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleDelete}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      Xóa
                    </button>
                    <button
                      onClick={closePopup}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                    >
                      Hủy
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}