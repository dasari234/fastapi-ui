import { useContext } from "react";
import { UserContext, type UserContextProps } from "../context/AuthContext";

export const useAuthContext = (): UserContextProps => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
