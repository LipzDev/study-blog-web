export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

export enum UserProvider {
  LOCAL = "local",
  GOOGLE = "google",
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  createdAt: string;
  updatedAt: string;
  role: string;
  emailVerified?: boolean;
  provider?: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  text: string;
  image?: string;
  imagePath?: string;
  authorId: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPosts {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface CreatePostRequest {
  slug: string;
  title: string;
  text: string;
  image?: string;
  imagePath?: string;
}

export interface UpdatePostRequest {
  slug?: string;
  title?: string;
  text?: string;
  image?: string;
  imagePath?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
  verified?: boolean;
}

export interface UploadResponse {
  message: string;
  filename: string;
  originalName: string;
  size: number;
  url: string;
}
