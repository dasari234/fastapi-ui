import { CircleUser, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks";
import { getInitials, getLocalStorage } from "../lib/utils";
import { Dropdown } from "./ui/dropdown/Dropdown";

export default function Header() {
  const { logout, isAuthenticated } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    setTimeout(() => {
      const storedUser = getLocalStorage("user") as {
        first_name?: string;
        last_name?: string;
        role?: string;
        last_login?: string;
      };

      const initials = getInitials(
        `${storedUser?.first_name ?? ""} ${storedUser?.last_name ?? ""}`
      );

      const userFullname = `${storedUser?.first_name ?? ""} ${
        storedUser?.last_name ?? ""
      } (${storedUser?.role})`;
      
      setUsername(initials);
      setUserRole(userFullname);
      setIsLoading(false);
    }, 200);
  }, []);

  const dropdownItems = [
    {
      label: userRole,
      onClick: () => console.log("clicked on role"),
      icon: <CircleUser className="w-4 h-4 text-gray-400" />,
      iconPosition: "left" as const,
    },
    // {
    //   label: "My Profile",
    //   onClick: () => console.log("Home clicked"),
    //   icon: <CircleUser className="w-4 h-4" />,
    //   iconPosition: "left" as const,
    // },
    // {
    //   label: "Settings",
    //   onClick: () => console.log("Settings clicked"),
    //   icon: <Settings className="w-4 h-4" />,
    //   iconPosition: "left" as const,
    // },
    {
      label: "Logout",
      onClick: logout,
      icon: <LogOut className="w-4 h-4 text-gray-400" />,
      iconPosition: "left" as const,
    },
  ];

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-500">Sentinel Demo</h1>
        {/* <Navbar />        */}
        {!isLoading && isAuthenticated && (
          <div className="flex justify-center items-center">
            <Dropdown items={dropdownItems} text={username} />
          </div>
        )}
      </div>
    </header>
  );
}
