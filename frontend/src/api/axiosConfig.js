import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // trỏ tới backend
});

export default api;
