export interface UserRoot {
  status: string;
  code: number;
  data: UserResponse;
  message: string;
}

export interface UserResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "user";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string;
}


export interface Login {
  username: string;
  password: string;
  success?: boolean;
}

export interface Auth {
  access_token: string;
  expires_in: number;
  token_type: string;
}

