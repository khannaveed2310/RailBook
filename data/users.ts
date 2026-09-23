import type { User } from "@/types/user";

export const mockUser: User = {
  id: "user-1",
  name: "Mohd Naveed Khan",
  email: "naveed@example.com",
  phone: "9876543210",
  password: "Password@123",
  role: "USER",
};

export const mockAdmin: User = {
  id: "admin-1",
  name: "RailBook Admin",
  email: "admin@railbook.com",
  phone: "9999999999",
  password: "Admin@123",
  role: "ADMIN",
};