import { useEffect, useState } from "react";
import Layout from "../components/Layout";

export default function BeNuoi() {
  const API_URL = "http://localhost:5000/api/tank";

  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(""); // create | edit | view | delete
  const [selectedTank, setSelectedTank] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    type: "",
    size: "",
    location: "",
  });

  // Token from localStorage
  const token = localStorage.getItem("token");

  // Load tanks
  const loadTanks = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTanks(data);
    } catch (err) {
      console.log("Error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTanks();
  }, []);

  // Open popup
  const openPopup = (type, tank = null) => {
    setPopupType(type);
    setSelectedTank(tank);
    setShowPopup(true);

    if (tank) setForm(tank);
    else setForm({ name: "", type: "", size: "", location: "" });
  };

  // Close popup
  const closePopup = () => {
    setShowPopup(false);
    setSelectedTank(null);
    setForm({ name: "", type: "", size: "", location: "" });
  };

  // Submit form (create/edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = popupType === "edit" ? "PUT" : "POST";
      const url =
        popupType === "edit"
          ? `${API_URL}/${selectedTank._id}`
          : API_URL;

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      loadTanks();
      closePopup();
    } catch (err) {
      console.log(err);
    }
  };

  // Delete tank
  const handleDelete = async () => {
    try {
      await fetch(`${API_URL}/${selectedTank._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      loadTanks();
      closePopup();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Layout>
      <div className="flex justify-center py-12">
        <div className="w-full max-w-5xl p-8 bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-blue-600">Quản lý Bể Nuôi</h1>
            <button
              onClick={() => openPopup("create")}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
            >
              + Thêm Bể
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <p className="text-center text-gray-600">Đang tải...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow rounded-xl overflow-hidden">
                <thead className="bg-blue-500 text-white">
                  <tr>
                    <th className="py-3 px-4">Tên bể</th>
                    <th className="py-3 px-4">Loại</th>
                    <th className="py-3 px-4">Dung tích (L)</th>
                    <th className="py-3 px-4">Vị trí</th>
                    <th className="py-3 px-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {tanks.map((tank) => (
                    <tr key={tank._id} className="border-b hover:bg-gray-100">
                      <td className="py-3 px-4">{tank.name}</td>
                      <td className="py-3 px-4">{tank.type}</td>
                      <td className="py-3 px-4">{tank.size}</td>
                      <td className="py-3 px-4">{tank.location}</td>
                      <td className="py-3 px-4 flex gap-2">
                        <button
                          onClick={() => openPopup("view", tank)}
                          className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                        >
                          Xem
                        </button>
                        <button
                          onClick={() => openPopup("edit", tank)}
                          className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => openPopup("delete", tank)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* POPUP */}
          {showPopup && (
            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 backdrop-blur-sm z-50">
              <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl relative">
                {/* VIEW */}
                {popupType === "view" && selectedTank && (
                  <>
                    <h2 className="text-2xl font-bold mb-4 text-blue-600">Chi tiết bể</h2>
                    <p><strong>Tên bể:</strong> {selectedTank.name}</p>
                    <p><strong>Loại:</strong> {selectedTank.type}</p>
                    <p><strong>Dung tích:</strong> {selectedTank.size} L</p>
                    <p><strong>Vị trí:</strong> {selectedTank.location}</p>
                    <button
                      onClick={closePopup}
                      className="w-full mt-4 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
                    >
                      Đóng
                    </button>
                  </>
                )}

                {/* CREATE / EDIT */}
                {(popupType === "create" || popupType === "edit") && (
                  <>
                    <h2 className="text-2xl font-bold mb-4 text-blue-600">
                      {popupType === "create" ? "Thêm bể mới" : "Cập nhật bể"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <input
                        type="text"
                        placeholder="Tên bể"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Loại"
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                        className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Dung tích (L)"
                        value={form.size}
                        onChange={(e) => setForm({ ...form, size: e.target.value })}
                        className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Vị trí"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />

                      <button className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition">
                        {popupType === "create" ? "Thêm mới" : "Cập nhật"}
                      </button>
                    </form>
                    <button
                      onClick={closePopup}
                      className="w-full mt-3 bg-gray-300 py-2 rounded-xl hover:bg-gray-400 transition"
                    >
                      Hủy
                    </button>
                  </>
                )}

                {/* DELETE */}
                {popupType === "delete" && selectedTank && (
                  <>
                    <h2 className="text-2xl font-bold mb-4 text-red-600">Xóa bể?</h2>
                    <p>Bạn có chắc muốn xóa <strong>{selectedTank.name}</strong>?</p>
                    <button
                      onClick={handleDelete}
                      className="w-full mt-4 bg-red-600 text-white py-2 rounded-xl hover:bg-red-700 transition"
                    >
                      Xóa
                    </button>
                    <button
                      onClick={closePopup}
                      className="w-full mt-3 bg-gray-300 py-2 rounded-xl hover:bg-gray-400 transition"
                    >
                      Hủy
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
