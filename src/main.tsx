import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import "./styles.css"; // not "../styles.css"

const rootEl = document.getElementById("root")!;
ReactDOM.createRoot(rootEl).render(<RouterProvider router={router} />);
