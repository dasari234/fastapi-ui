import { Bell, KeyRound, Mail, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Tabs } from "../../components/ui/tabs";
import type { Tab, TabConfig } from "../../components/ui/tabs/tab-types";
import ChangePassword from "./ChangePassword";
import MyProfile from "./MyProfile";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    document.title = "Profile";
  }, []);

  const ProfileContent = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      <p>Manage your profile settings and preferences here.</p>
    </div>
  );

  const MessagesContent = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Messages</h2>
      <p>Check your messages and notifications.</p>
    </div>
  );

  const NotificationsContent = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>
      <p>View and manage your notifications.</p>
    </div>
  );

  const sampleTabs: Tab[] = [
    {
      id: "profile",
      label: "My Profile",
      icon: <User className="w-4 h-4" />,
      component: <MyProfile />,
      closable: false,
    },
    {
      id: "ChangePassword",
      label: "Change Password",
      icon: <KeyRound className="w-4 h-4" />,
      component: <ChangePassword />,
      closable: false,
    },
    {
      id: "messages",
      label: "Messages",
      icon: <Mail className="w-4 h-4" />,
      component: <MessagesContent />,
      closable: false,
      disabled: false,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="w-4 h-4" />,
      component: <NotificationsContent />,
      closable: false,
    },
    {
      id: "settings2",
      label: "Settings2",
      icon: <Settings className="w-4 h-4" />,
      component: <ProfileContent />,
      closable: false,
    },
    {
      id: "messages2",
      label: "Messages2",
      icon: <Mail className="w-4 h-4" />,
      component: <MessagesContent />,
      closable: false,
      disabled: false,
    },
    {
      id: "notifications2",
      label: "Notifications2",
      icon: <Bell className="w-4 h-4" />,
      component: <NotificationsContent />,
      closable: false,
    },
  ];

  const defaultConfig: TabConfig = {
    variant: "pills",
    position: "top",
    animation: "fade",
    animationDuration: 300,
    addable: false,
    draggable: true,
    maxTabs: 3,
    showNavigationButtons: true,
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Tabs
        tabs={sampleTabs}
        config={defaultConfig}
        onTabChange={handleTabChange}
        activeTab={activeTab}
        className="flex-1"
        contentClassName="p-6 flex-1 overflow-auto"
      />
    </div>
  );
}
