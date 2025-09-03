import DocumentList from "./components/DocumentList";
// import { Dropdown } from "./components/ui/dropdown/Dropdown";
// import { DropdownContent } from "./components/ui/dropdown/DropdownContent";
// import { DropdownItem } from "./components/ui/dropdown/DropdownItem";
// import { DropdownLabel } from "./components/ui/dropdown/DropdownLabel";
// import { DropdownSeparator } from "./components/ui/dropdown/DropdownSeparator";
// import { DropdownTrigger } from "./components/ui/dropdown/DropdownTrigger";
import "./index.css";

function App() {
  // const handleProfileSelect = () => {
  //   console.log("Profile clicked");
  // };

  // const handleLogoutSelect = () => {
  //   console.log("Logout clicked");
  // };

  return (
    <>
      {/* <Dropdown onOpenChange={(isOpen) => console.log("Dropdown is:", isOpen)}>
        <DropdownTrigger className="bg-blue-500 text-white hover:bg-blue-600">
          Open Menu
          <svg
            className="ml-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </DropdownTrigger>

        <DropdownContent align="start" sideOffset={8}>
          <DropdownLabel>Account</DropdownLabel>
          <DropdownItem onSelect={handleProfileSelect}>Profile</DropdownItem>
          <DropdownItem onSelect={() => console.log("Settings clicked")}>
            Settings
          </DropdownItem>

          <DropdownSeparator />

          <DropdownLabel>Actions</DropdownLabel>
          <DropdownItem onSelect={() => console.log("New project")}>
            New Project
          </DropdownItem>
          <DropdownItem disabled>Delete (disabled)</DropdownItem>

          <DropdownSeparator />

          <DropdownItem onSelect={handleLogoutSelect}>
            <span className="text-red-600">Logout</span>
          </DropdownItem>
        </DropdownContent>
      </Dropdown> */}
      <div className="card">
        <DocumentList />
      </div>
    </>
  );
}

export default App;
