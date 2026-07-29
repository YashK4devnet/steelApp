export interface User {
  id: string | number;
  name: string;
  login?: string;
  email: string;
  phone?: string;
  company_id?: number;
  company_name?: string;
  is_admin?: boolean;
  is_security?: boolean;
  employee_id?: number;
  employee_address_id?: number;
  employee_address_name?: string;
  role?: string;
}
