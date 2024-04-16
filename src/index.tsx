import { createRoot } from "react-dom/client";
import { App } from "./App.js";

if (module.hot !== undefined) {
    module.hot.accept();
}

const container = document.getElementById("container");
const root = createRoot(container!);
root.render(<App />);
