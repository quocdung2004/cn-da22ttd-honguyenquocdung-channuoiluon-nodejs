import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import BeNuoi from "./pages/BeNuoi.jsx";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/BeNuoi" element={<BeNuoi />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
