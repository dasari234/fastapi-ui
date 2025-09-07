import { createContext } from "react";
import type { Login, UserResponse } from "../types";


export interface UserContextProps {
  user: UserResponse | null;
  login: (payload: Login) => Promise<void>;
  logout: () => void;
  setUser: (user: UserResponse | null) => void;
  isAuthenticated: boolean;
  isSidenav: boolean;
  toggleSidenav: () => void;
  isLoading: boolean;
}

export const UserContext = createContext<UserContextProps>(
  {} as UserContextProps
);
