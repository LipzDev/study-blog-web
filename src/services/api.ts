import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  User,
  Post,
  PaginatedPosts,
  CreatePostRequest,
  UpdatePostRequest,
  UploadResponse,
  ApiResponse,
} from "@/types";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Interceptor para adicionar token de autenticação
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para tratar erros
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      },
    );
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post(
      "/auth/login",
      data,
    );
    return response.data;
  }

  async register(data: RegisterRequest): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post(
      "/auth/register",
      data,
    );
    return response.data;
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post(
      "/auth/forgot-password",
      data,
    );
    return response.data;
  }

  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post(
      "/auth/reset-password",
      data,
    );
    return response.data;
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.get(
      `/auth/verify-email?token=${token}`,
    );
    return response.data;
  }

  async resendVerification(email: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post(
      "/auth/resend-verification",
      { email },
    );
    return response.data;
  }

  async checkVerificationStatus(email: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post(
      "/auth/check-verification-status",
      { email },
    );
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get("/auth/profile");
    return response.data;
  }

  // Posts endpoints
  async getPosts(): Promise<Post[]> {
    const response: AxiosResponse<Post[]> = await this.api.get("/posts");
    return response.data;
  }

  async getPaginatedPosts(params: {
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    authorId?: string;
  }): Promise<PaginatedPosts> {
    const response: AxiosResponse<PaginatedPosts> = await this.api.get(
      "/posts/paginated",
      { params },
    );
    return response.data;
  }

  async getPost(id: string): Promise<Post> {
    const response: AxiosResponse<Post> = await this.api.get(`/posts/${id}`);
    return response.data;
  }

  async getPostBySlug(slug: string): Promise<Post> {
    const response: AxiosResponse<Post> = await this.api.get(
      `/posts/slug/${slug}`,
    );
    return response.data;
  }

  async createPost(data: CreatePostRequest): Promise<Post> {
    const response: AxiosResponse<Post> = await this.api.post("/posts", data);
    return response.data;
  }

  async updatePost(id: string, data: UpdatePostRequest): Promise<Post> {
    const response: AxiosResponse<Post> = await this.api.patch(
      `/posts/${id}`,
      data,
    );
    return response.data;
  }

  async deletePost(id: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.delete(
      `/posts/${id}`,
    );
    return response.data;
  }

  // Upload endpoints
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("image", file);

    const response: AxiosResponse<UploadResponse> = await this.api.post(
      "/uploads/image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  }

  // Users endpoints (admin only)
  async getAllUsers(): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.api.get("/users");
    return response.data;
  }

  async searchUser(email?: string, name?: string): Promise<User> {
    const params = new URLSearchParams();
    if (email) params.append("email", email);
    if (name) params.append("name", name);

    const response: AxiosResponse<User> = await this.api.get(
      `/users/search?${params.toString()}`,
    );
    return response.data;
  }

  async promoteToAdmin(userId: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.patch(
      `/users/${userId}/promote-admin`,
    );
    return response.data;
  }

  async demoteFromAdmin(userId: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.patch(
      `/users/${userId}/revoke-admin`,
    );
    return response.data;
  }

  async deleteUser(userId: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.delete(
      `/users/${userId}`,
    );
    return response.data;
  }

  async updateUserName(userId: string, name: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.patch(
      `/users/${userId}/name`,
      { name },
    );
    return response.data;
  }
}

export const apiService = new ApiService();
