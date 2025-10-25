// index.js (Đã sửa)
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
// 1. ĐỔI IMPORT
import { MemoryRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* 2. ĐỔI TÊN COMPONENT */}
    <MemoryRouter>
      <App />
    </MemoryRouter>
  </React.StrictMode>
);
