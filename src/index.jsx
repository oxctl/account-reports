import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// not sure this is used, index.html invokes main.jsx

const container = document.getElementById("app");
const root = createRoot(container);
root.render(<App />);
