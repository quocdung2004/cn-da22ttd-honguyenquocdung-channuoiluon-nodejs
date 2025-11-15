import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      {/* HEADER */}
      <header className="bg-blue-600 text-white py-4 shadow">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">AquaFarm Manager</h1>
          <nav>
            <Link to="/" className="mr-4 hover:underline">Login</Link>
            <Link to="/register" className="mr-4 hover:underline">Register</Link>
            <Link to="/BeNuoi" className="mr-4 hover:underline">Bể nuôi</Link>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-grow">{children}</main>
      {/* FOOTER */}
      <footer className="bg-gray-800 text-gray-300 py-4 text-center">
        © {new Date().getFullYear()} AquaFarm — All rights reserved.
      </footer>
    </div>
  );
}
