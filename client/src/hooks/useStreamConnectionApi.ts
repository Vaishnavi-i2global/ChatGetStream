"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "../providers/auth.provider";
import axios from "axios";
export const useStreamConnectionApi = (user: User) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["streamConnection"],
    queryFn: () =>
      axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chat/stream_connection`, {
        user_id: user.id,
        name: user.username,
        image: "message",
      }),
    staleTime: 60 * 1000
  });

  return { data, isLoading, error };
};


export const useGetUsers = (search: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users", search],
    queryFn: () => axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/get_users?search=${search}`),
  });

  return { data, isLoading, error };
};

export const useCreateChannel = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: { sender_id: string; receiver_id: string; created_by: string }) =>
      axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chat/create_channel`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });

  return {
    createChannel: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error
  };
};