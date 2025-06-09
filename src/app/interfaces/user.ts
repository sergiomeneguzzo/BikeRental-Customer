export interface User {
  id?: string;
  firstName: string;
  lastName: string;
  picture?: string;
  username: string;
  role: 'customer' | 'operator';
  isConfirmed: boolean;
}
