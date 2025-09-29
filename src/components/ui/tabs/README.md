import { useState } from "react";
import { Tabs } from "./components/Tabs";
import type { Tab, TabConfig } from "./components/tab-types";
import { Home, User, Settings, Mail, Bell } from "lucide-react";

// Example tab content components
const HomeContent = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Home Dashboard</h2>
    <p>Welcome to the home tab! This is your main dashboard.</p>
  </div>
);

const ProfileContent = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">User Profile</h2>
    <p>Manage your profile settings and preferences here.</p>
  </div>
);

const SettingsContent = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Settings</h2>
    <p>Configure your application settings.</p>
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

// Sample tabs data
const sampleTabs: Tab[] = [
  {
    id: "home",
    label: "Home",
    icon: <Home className="w-4 h-4" />,
    component: <HomeContent />,
    closable: false
  },
  {
    id: "profile",
    label: "Profile",
    icon: <User className="w-4 h-4" />,
    component: <ProfileContent />,
    closable: true
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="w-4 h-4" />,
    component: <SettingsContent />,
    closable: true
  },
  {
    id: "messages",
    label: "Messages",
    icon: <Mail className="w-4 h-4" />,
    component: <MessagesContent />,
    closable: true,
    disabled: false
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell className="w-4 h-4" />,
    component: <NotificationsContent />,
    closable: true
  }
];

export default function App() {
  const [tabs, setTabs] = useState<Tab[]>(sampleTabs);
  const [activeTab, setActiveTab] = useState("home");

  // Configuration examples
  const defaultConfig: TabConfig = {
    variant: "default",
    position: "top",
    animation: "fade",
    animationDuration: 300,
    closable: true,
    addable: true,
    draggable: true,
    maxTabs: 10,
    showNavigationButtons: true
  };

  const pillsConfig: TabConfig = {
    variant: "pills",
    position: "top",
    animation: "scale",
    closable: true,
    addable: false
  };

  const underlineConfig: TabConfig = {
    variant: "underline",
    position: "top",
    animation: "slide",
    closable: true
  };

  const leftSidebarConfig: TabConfig = {
    variant: "default",
    position: "left",
    animation: "fade",
    closable: true
  };

  // Event handlers
  const handleTabChange = (tabId: string) => {
    console.log("Tab changed to:", tabId);
    setActiveTab(tabId);
  };

  const handleTabAdd = () => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      label: `New Tab ${tabs.length + 1}`,
      component: <div className="p-6">Content for new tab</div>,
      closable: true
    };
    
    setTabs(prev => [...prev, newTab]);
    console.log("New tab added");
  };

  const handleTabClose = (tabId: string) => {
    setTabs(prev => prev.filter(tab => tab.id !== tabId));
    console.log("Tab closed:", tabId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Tabs Component Examples</h1>
      
      {/* Example 1: Default Tabs */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Default Tabs</h2>
        <div className="bg-white rounded-lg shadow-md h-64">
          <Tabs
            tabs={tabs}
            config={defaultConfig}
            onTabChange={handleTabChange}
            onTabAdd={handleTabAdd}
            onTabClose={handleTabClose}
            className="h-full"
          />
        </div>
      </div>

      {/* Example 2: Pills Variant */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. Pills Variant</h2>
        <div className="bg-white rounded-lg shadow-md h-64">
          <Tabs
            tabs={tabs.slice(0, 3)} // Only show first 3 tabs
            config={pillsConfig}
            onTabChange={handleTabChange}
            onTabClose={handleTabClose}
            className="h-full"
          />
        </div>
      </div>

      {/* Example 3: Underline Variant */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">3. Underline Variant</h2>
        <div className="bg-white rounded-lg shadow-md h-64">
          <Tabs
            tabs={tabs.slice(0, 4)}
            config={underlineConfig}
            onTabChange={handleTabChange}
            onTabClose={handleTabClose}
            className="h-full"
          />
        </div>
      </div>

      {/* Example 4: Left Sidebar Tabs */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">4. Left Sidebar Tabs</h2>
        <div className="bg-white rounded-lg shadow-md h-96">
          <Tabs
            tabs={tabs}
            config={leftSidebarConfig}
            onTabChange={handleTabChange}
            onTabClose={handleTabClose}
            className="h-full"
          />
        </div>
      </div>

      {/* Example 5: Cards Variant */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">5. Cards Variant</h2>
        <div className="bg-white rounded-lg shadow-md h-64">
          <Tabs
            tabs={tabs.slice(0, 3)}
            config={{
              variant: "cards",
              position: "top",
              animation: "fade"
            }}
            onTabChange={handleTabChange}
            onTabClose={handleTabClose}
            className="h-full"
          />
        </div>
      </div>

      {/* Example 6: Bottom Tabs */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">6. Bottom Tabs</h2>
        <div className="bg-white rounded-lg shadow-md h-64">
          <Tabs
            tabs={tabs.slice(0, 3)}
            config={{
              variant: "default",
              position: "bottom",
              animation: "fade"
            }}
            onTabChange={handleTabChange}
            onTabClose={handleTabClose}
            className="h-full"
          />
        </div>
      </div>

      {/* Example 7: No Animation */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">7. No Animation</h2>
        <div className="bg-white rounded-lg shadow-md h-64">
          <Tabs
            tabs={tabs.slice(0, 3)}
            config={{
              variant: "default",
              position: "top",
              animation: "none"
            }}
            onTabChange={handleTabChange}
            onTabClose={handleTabClose}
            className="h-full"
          />
        </div>
      </div>

      {/* Example 8: Disabled Tab */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">8. With Disabled Tab</h2>
        <div className="bg-white rounded-lg shadow-md h-64">
          <Tabs
            tabs={[
              ...tabs.slice(0, 2),
              {
                id: "disabled-tab",
                label: "Disabled Tab",
                icon: <Settings className="w-4 h-4" />,
                component: <div className="p-6">This tab is disabled</div>,
                disabled: true,
                closable: false
              },
              ...tabs.slice(3, 4)
            ]}
            config={defaultConfig}
            onTabChange={handleTabChange}
            onTabClose={handleTabClose}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}