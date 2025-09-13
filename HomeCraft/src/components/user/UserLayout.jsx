import { Outlet } from "react-router-dom";
import { Header, Footer } from "../index";

export default function UserLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet /> {/* All user pages will render here */}
      </main>
      <Footer />
    </div>
  );
}
