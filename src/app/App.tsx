import { RouterProvider } from "react-router";
import { router } from "./routes";
import { HealthProvider } from "./context/HealthContext";

export default function App() {
  return (
    <HealthProvider>
      <RouterProvider router={router} />
    </HealthProvider>
  );
}