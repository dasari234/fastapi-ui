import { useEffect, useState } from "react";

import { DynamicForm, type Field } from "../../components/DynamicForm";
import { getLocalStorage } from "../../lib/utils";
import type { UserResponse } from "../../types";

export default function Profile() {
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    const loggedInUser = getLocalStorage("user") as UserResponse | null;
    console.log(loggedInUser);
    setUser(loggedInUser);
  }, []);

  const formFields: Field[] = [
    { label: "First Name", name: "first_name", type: "text", disabled: false },
    { label: "Last Name", name: "last_name", type: "text", disabled: false },
    { label: "Email", name: "email", type: "email", disabled: false },
    
  ];

  return (
    <>
      {/* <h1>User's Profile</h1> */}
      {user ? (
        <div
          className="p-4 justify-self-center
 w-lg"
        >
          <DynamicForm
            formFields={formFields}
            initialValues={user ?? undefined}
            buttonLabel="Update"
          />
        </div>
      ) : (
        <p>User Details not Found</p>
      )}
    </>
  );
}
