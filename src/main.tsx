import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { SocketProvider } from "./contexts/SocketProvider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <SocketProvider>
    <App />
  </SocketProvider>
);
