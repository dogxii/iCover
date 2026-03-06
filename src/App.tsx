import { Header } from "./components/organisms/Header";
import { HomePage } from "./pages/HomePage";

export function App() {
  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "var(--color-bg)" }}>
      <Header />
      <HomePage />
    </div>
  );
}
