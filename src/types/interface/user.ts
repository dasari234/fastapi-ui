export interface UserRoot {
    status: string
    code: number
    data: UserResponse
    message: string
  }

export interface UserResponse {
    id: number
    employee_id: string
    first_name: string
    last_name: string
    email: string
    email_verified_at: string | null
    mobile: string | number | null
    created_at: string
    updated_at: string
    created_by: number
    last_updated_by: number
    ip_added: string
    ip_modified: string
    deleted_at: string | number | null
    last_login_datetime: string
    parent_user_id: number
    css_user_id: string | number | null
    usermeta: Usermeta
    user_roles: UserRole[]
  }
  
  export interface Usermeta {
    id: number
    user_id: number
    title_id: number
    business_phone: string | number | null
    business_ext: string
    hired_date: string
    terminated_date: string | number | null
    status: number
    created_at: string
    updated_at: string
    deleted_at: string | number | null
  }
  
  export interface UserRole {
    id: number
    user_id: number
    role_id: number
    deleted_at: string | number | null
    created_at: string | number | null
    updated_at: string | number | null
    role: Role
  }
  
  export interface Role {
    id: number
    parent_id: number
    name: string
    note: string | number | null
    status: number
    created_at: string | number | null
    updated_at: string | number | null
    deleted_at: string | number | null
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
  
  export interface LoginResponse {
    code: number;
    data: Auth;
    message: string;
    status: string;
  }
