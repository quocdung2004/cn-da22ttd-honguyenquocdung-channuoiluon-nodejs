import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout.jsx";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMsg("Vui lòng nhập email và mật khẩu");
      return;
    }

    setMsg("");
    alert(`Đăng nhập thành công!\nEmail: ${email}`);
    navigate("/dashboard");
  };

  return (
    <Layout>
      <div className="flex justify-center items-center py-20">
        <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">
            Đăng nhập
          </h2>

          {msg && (
            <p className="bg-red-100 text-red-600 p-2 rounded mb-4 text-center">
              {msg}
            </p>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-600 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-400"
                placeholder="Nhập email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Mật khẩu</label>
              <input
                type="password"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-400"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Đăng nhập
            </button>
          </form>

          <p className="mt-4 text-center text-gray-700">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
