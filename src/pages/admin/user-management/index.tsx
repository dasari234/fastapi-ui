import { SquarePen, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { DynamicForm, type Field } from "../../../components/DynamicForm";
import DynamicTable, {
  type DynamicTableRef,
} from "../../../components/table/DynamicTable";
import { Button } from "../../../components/ui/Button";
import Modal from "../../../components/ui/modal/Modal";
import Tooltip from "../../../components/ui/Tooltip";
import { useAuthContext } from "../../../hooks";
import UserService from "../../../services/userService";
import type { Signup, UserResponse } from "../../../types";

interface DeleteApiResponse {
  success: boolean;
  error: string;
  message?: string;
  data?: {
    deleted_user_id: number;
  };
}

function UserManagement() {
  const { user } = useAuthContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formType, setFormType] = useState<string>("add");
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>();

  const tableRef = useRef<DynamicTableRef>(null);

  const formFields: Field<Signup>[] = [
    {
      label: "First Name",
      name: "first_name",
      type: "text",
      disabled: false,
      rules: { required: "First Name is required", minLength: 3 },
    },
    {
      label: "Last Name",
      name: "last_name",
      type: "text",
      disabled: false,
      rules: { required: "Last Name is required", minLength: 3 },
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      disabled: false,
      rules: { required: "Email is required", pattern: /^\S+@\S+$/i },
    },
    {
      label: "Password",
      name: "password",
      type: "password",
      disabled: false,
      isVisible: formType === "add",
      rules: {
        required: "Password is required",
        minLength: 8,
        pattern: /[A-Z]/,
      },
    },
    {
      label: "Role",
      name: "role",
      type: "select",
      options: [
        { label: "User", value: "user" },
        { label: "Admin", value: "admin" },
      ],
      disabled: false,
    },
  ];

  const handleAddClick = () => {
    setSelectedUser(null);
    setFormType("add");
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    if (isModalOpen) {
      setIsModalOpen(false);
    }
  };

  const handleDelete = (item: UserResponse) => {
    if (Number(item.id) === user?.id) return;
    setSelectedUser(item);
    setDeleteModal(true);
  };

  const handleEdit = async (user: UserResponse) => {
    try {
      setFormType("edit");
      setIsModalOpen(true);
      setSelectedUser(user);
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleSubmit = async (values: Signup) => {
    try {
      setIsLoading(true);
      const payload = { ...values };
      if (formType === "add") {
        const response = (await UserService.register(payload)) as {
          success?: boolean;
          message?: string;
          data?: UserResponse;
        };
        if (!response?.success) {
          toast.error(response?.message || "Failed to Add User");
          return;
        }
        if (response.success) {
          setIsModalOpen(false);
          toast.success(response?.message || "User created successfully");
        }
      } else if (formType === "edit") {
        if (!selectedUser?.id) {
          return;
        }
        const stringValues: Record<string, string> = Object.fromEntries(
          Object.entries(values)
            .filter(
              ([, value]) =>
                value !== undefined && value !== null && value !== ""
            )
            .map(([key, value]) => [key, String(value)])
        );
        const response = (await UserService.updateUser(
          selectedUser?.id,
          stringValues
        )) as { success?: boolean; message?: string; data?: UserResponse };

        setIsModalOpen(false);
        toast.success(response?.message || "User updated successfully");
      }

      tableRef.current?.refresh();
    } catch {
      toast.error(`Failed to ${formType} user`);
      setIsModalOpen(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser?.id) return;
    try {
      const response = (await UserService.deleteUser(
        selectedUser.id
      )) as unknown as DeleteApiResponse;

      setDeleteModal(false);
      if (response && typeof response === "object" && "success" in response) {
        if (!response.success) {
          toast.error(
            (response && response.message) || "Failed to Delete User"
          );
        } else {
          toast.success("User Deleted");
        }

        tableRef.current?.refresh();
      }
    } catch {
      toast.error("Failed to Delete user");
    }
  };

  useEffect(() => {
    document.title = "User Management";
  }, []);

  return (
    <>
      <h1>User's List</h1>
      {isModalOpen && (
        <Modal
          title={formType === "add" ? "Add User" : "Edit User"}
          open={isModalOpen}
          onClose={handleModalClose}
          showCloseButton={true}
        >
          <div className="max-h-[80vh] overflow-auto p-2">
            <DynamicForm<Signup>
              formFields={formFields}
              buttonLabel={formType === "add" ? "Add User" : "Update User"}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              initialValues={
                (selectedUser as unknown as Partial<Record<string, unknown>>) ??
                undefined
              }
            />
          </div>
        </Modal>
      )}

      <DynamicTable<UserResponse>
        url="/users"
        ref={tableRef}
        actionButton={[{ label: "Add User", onClick: handleAddClick }]}
        columns={[
          { key: "first_name", label: "First Name" },
          { key: "last_name", label: "Last Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <div className="flex gap-4">
                <Tooltip content="edit" maxWidth="max-w-xl">
                  <Button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleEdit(row)}
                    variant="ghost"
                  >
                    <SquarePen
                      className="size-3.5"
                      color="var(--color-blue-600)"
                    />
                  </Button>
                </Tooltip>

                <Tooltip
                  content="Delete"
                  maxWidth="max-w-xl"
                  disabled={row.id === user?.id}
                >
                  <Button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(row)}
                    disabled={row.id === user?.id}
                    variant="ghost"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </Tooltip>
              </div>
            ),
          },
        ]}
        responseKey="users"
      />

      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete User"
        showCloseButton={true}
      >
        <div className="max-h-[80vh] overflow-auto pr-4">
          <h1>
            Are you sure, you want to delete <b>{selectedUser?.first_name}</b> ?
          </h1>
          <div className="flex justify-end gap-4 mt-5">
            <Button variant="outline" onClick={() => setDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteUser}
            >
              Yes, Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default UserManagement;
