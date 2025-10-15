import { CircleUser, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks";
import { getInitials } from "../lib/utils";
import UserService from "../services/userService";
import { UserNotifications } from "./notifications/UserNotifications";
import { Dropdown } from "./ui/dropdown/Dropdown";

export default function Header() {
  const { logout, isAuthenticated, user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isAdmin = UserService.isAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      const storedUser = user as {
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
      } (Role:${storedUser?.role})`;

      setUsername(initials);
      setUserRole(userFullname);
      setIsLoading(false);
    }, 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dropdownItems = [
    {
      label: userRole,
      onClick: () => console.log("clicked on role"),
      icon: <CircleUser className="w-4 h-4 text-gray-400" />,
      iconPosition: "left" as const,
    },
    {
      label: "My Profile",
      onClick: () => navigate("/profile"),
      icon: <CircleUser className="w-4 h-4 text-gray-400" />,
      iconPosition: "left" as const,
    },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-4 h-14 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-500">
          <Link to={isAdmin ? "/admin" : "/"}>Sentinel Demo</Link>
        </h1>
        {/* <Navbar />        */}

        {!isLoading && isAuthenticated && (
          <div className="flex items-center space-x-6">
            {/* Notifications */}
            <div className="flex items-center space-x-2">
              <UserNotifications />
            </div>

            {/* User dropdown */}
            <div className="flex justify-center items-center">
              <Dropdown
                items={dropdownItems}
                text={username}
                isOpen={dropdownOpen}
                onToggle={setDropdownOpen}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
