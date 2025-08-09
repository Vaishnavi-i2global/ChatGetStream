"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "../providers/auth.provider";
import axios from "axios";

// Mock API functions for authentication
// In a real app, these would make actual API calls

interface LoginCredentials {
    email: string;
    password: string;
}

interface SignupCredentials {
    email: string;
    username: string;
    password: string;
}

// Custom hooks for authentication API calls
export function useLoginMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (credentials: LoginCredentials) => {
            return axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, credentials);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
}

export function useSignupMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (credentials: SignupCredentials) => {
            return axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/signup`, credentials);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
}
