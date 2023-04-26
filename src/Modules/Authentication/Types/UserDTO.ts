export default interface UserDTO {
  id: string;
  username: string;
  firstName: string;
  lastName?: string;
  email: string;
  phoneNo?: string;
  avatar: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  vendor: {
    id: string;
    username: string;
    name: string;
    userId: string;
    certified: boolean;
    status: string;
    phone: string | null;
    desc: string;
    category: string[];
    createdAt: string;
    updatedAt: string;
  } | null;
  admin: any;
}
