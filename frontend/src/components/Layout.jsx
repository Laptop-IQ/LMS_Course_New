import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { TOKEN_KEY } from "@/constants/auth";
import { useSidebar } from "@/context/SidebarContext"; // ✅ context import karo

const Layout = () => {
  const isSignedIn = !!localStorage.getItem(TOKEN_KEY);
  const { collapsed } = useSidebar(); // ✅ collapse state read karo

  return (
    <div className="flex min-h-screen" style={{ background: "#060d1a" }}>
      {isSignedIn && <Sidebar />}
      {!isSignedIn && <Navbar />}

      <main
        className="flex-1 min-w-0 transition-all duration-300"
        style={{
          // ✅ Sidebar ke actual pixel widths se match karo
          // Sidebar.jsx mein: collapsed = w-[72px], expanded = w-[272px]
          marginLeft: isSignedIn ? (collapsed ? "72px" : "272px") : "0",
          paddingTop: isSignedIn
            ? "64px" // ✅ TopBar height account karo (h-[64px])
            : "0",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
