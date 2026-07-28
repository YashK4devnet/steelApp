export interface User {
  id: string;
  name: string;
  email: string;
  role: 'security' | 'manager';
}
