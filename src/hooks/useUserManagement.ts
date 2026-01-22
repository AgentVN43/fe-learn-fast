import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/authService";

export const useGetAllUsers = (page = 1, limit = 20, isActive?: boolean) => {
  return useQuery({
    queryKey: ["users", page, limit, isActive],
    queryFn: () => userService.getAllUsers(page, limit, isActive),
  });
};

export const useGetUserById = (id: string | undefined) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => {
      if (!id) throw new Error("User ID required");
      return userService.getUserById(id);
    },
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
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
    }) => userService.createUser(email, password, name, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Record<string, any>;
    }) => userService.updateUser(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
    },
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useReactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.reactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
