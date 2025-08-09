"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "../providers/auth.provider";

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

// Mock API functions
const mockLoginApi = async (credentials: LoginCredentials): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate validation
    if (!credentials.email || !credentials.password) {
        throw new Error("Email and password are required");
    }

    // Return mock user data
    return {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        email: credentials.email,
        username: credentials.email.split("@")[0],
    };
};

const mockSignupApi = async (credentials: SignupCredentials): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate validation
    if (!credentials.email || !credentials.username || !credentials.password) {
        throw new Error("All fields are required");
    }

    // Return mock user data
    return {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        email: credentials.email,
        username: credentials.username,
    };
};

// Custom hooks for authentication API calls
export function useLoginMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: mockLoginApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
}

export function useSignupMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: mockSignupApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
}
