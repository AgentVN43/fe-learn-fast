import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/authService";

export const useAuth = () => {
  const queryClient = useQueryClient();

  // ============= Query: Get current user =============
  const { data: user, isLoading, error: userError } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      if (!authService.isAuthenticated()) {
        return null;
      }
      try {
        const result = await authService.me();
        return result.user;
      } catch (error) {
        console.error("❌ Failed to fetch user:", error);
        // Token invalid, clear auth
        authService.logout();
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // ============= Mutation: Login =============
  const loginMutation = useMutation({
    mutationFn: ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => authService.login(email, password),
    onSuccess: (data) => {
      console.log("✅ Login success");
      authService.saveAuth(data.token, data.user);
      queryClient.setQueryData(["auth", "me"], data.user);
    },
    onError: (error) => {
      console.error("❌ Login failed:", error);
    },
  });

  // ============= Mutation: Register =============
  const registerMutation = useMutation({
    mutationFn: ({
      email,
      password,
      name,
      role,
    }: {
      email: string;
      password: string;
      name: string;
      role: "Admin" | "Assistant";
    }) => authService.register(email, password, name, role),
    onSuccess: (data) => {
      console.log("✅ Register success");
      authService.saveAuth(data.token, data.user);
      queryClient.setQueryData(["auth", "me"], data.user);
    },
    onError: (error) => {
      console.error("❌ Register failed:", error);
    },
  });

  // ============= Mutation: Logout =============
  const logoutMutation = useMutation({
    mutationFn: () => {
      authService.logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      console.log("✅ Logout success");
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.clear();
    },
  });

  // ============= Return consolidated state =============
  return {
    // User state
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    userError: userError?.message,

    // Login
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error?.message,

    // Register
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error?.message,

    // Logout
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
};
