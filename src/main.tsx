import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";

const rootEl = document.getElementById("root")!;
ReactDOM.createRoot(rootEl).render(<RouterProvider router={router} />);
