import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";

// import Sidenav from "../components/sidenav/Sidenav";

const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        {/* <div className="main-sidebar">
          <Sidenav />
        </div> */}
        <main className="flex-1 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default RootLayout;
