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
        image: user.email,
      }),
    staleTime: 60 * 1000,
  });

  return { data, isLoading, error };
};
