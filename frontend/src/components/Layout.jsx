import { Link } from "react-router-dom";
import { useContext, useState, createContext, useEffect, useRef } from "react";
import axios from "axios";
import { MessageSquare, X, Send, Bot, AlertTriangle } from "lucide-react";

// ⚠️ KHI CHẠY DỰ ÁN THẬT: Bỏ chú thích 2 dòng dưới và xóa các phần giả lập bên dưới
import { AuthContext } from "../components/trangThaiDangNhap"; 
import AIConsultant from "../components/AIConsultant"; 


// --- MAIN LAYOUT ---
export default function Layout({ children }) {
  const { isLoggedIn, logout } = useContext(AuthContext);

  const handleLogoutConfirmation = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?")) {
      logout();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 relative font-sans"> {/* Thêm relative để an toàn */}

      {/* HEADER */}
      <header className="bg-blue-600 text-white py-4 shadow sticky top-0 z-40"> {/* Sticky header */}
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">AquaEel Manager</h1>

          <nav>
            {isLoggedIn ? (
              <div className="flex items-center space-x-4 text-sm font-medium">
                {/* Các link điều hướng */}
                <Link to="/GiongLuon" className="hover:text-blue-200 transition">Giống lươn</Link>
                <Link to="/Thuoc" className="hover:text-blue-200 transition">Thuốc</Link>
                <Link to="/ThucAn" className="hover:text-blue-200 transition">Thức ăn</Link>
                <Link to="/BeNuoi" className="hover:text-blue-200 transition">Bể nuôi</Link>
                <Link to="/MoiTruong" className="hover:text-blue-200 transition">Môi Trường</Link>
                <Link to="/SucKhoe" className="hover:text-blue-200 transition">Sức khỏe</Link>
                <Link to="/ChiPhiVanHanh" className="hover:text-blue-200 transition">Vận hành</Link>
                <Link to="/NhatKyChoAn" className="hover:text-blue-200 transition">Nhật ký ăn</Link>
                <Link to="/XuatBan" className="hover:text-blue-200 transition">Xuất bán</Link>
                <Link to="/TaiChinh" className="hover:text-blue-200 transition">Tài chính</Link>
                
                <button
                  onClick={handleLogoutConfirmation}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md transition shadow-sm ml-4"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/" className="hover:underline">Login</Link>
                <Link to="/register" className="hover:underline">Register</Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow p-4">
        {children}
        <div className="text-center mt-10 text-gray-400 italic">
            (Nội dung trang con sẽ hiển thị ở đây)
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-800 text-gray-300 py-4 text-center">
        © {new Date().getFullYear()} AquaEel Manager — All rights reserved.
      </footer>

      {/* 2. NHÚNG AI CONSULTANT Ở ĐÂY (Chỉ hiện khi đã đăng nhập) */}
      {isLoggedIn && <AIConsultant />}

    </div>
  );
}