"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSignupMutation } from "@/hooks/useAuthApi";
import { useLoginMutation } from "@/hooks/useAuthApi";
import { useToast } from "@/providers/toast.provider";
// Define user type
export interface User {
    id?: string;
    email: string;
    username: string;
}

// Define auth context type
interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, username: string, password: string) => Promise<void>;
    logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: React.PropsWithChildren) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const signupMutation = useSignupMutation();
    const loginMutation = useLoginMutation();
    const { showToast } = useToast();

    // Check if user is logged in on initial load
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    // Login function
    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await loginMutation.mutateAsync({ email, password });
            setUser(response.data);
            localStorage.setItem("user", JSON.stringify(response.data));
            router.push("/dashboard");
        } catch (error: any) {
            console.log("Login failed:", error.response.data.detail);
            showToast(error.response.data.detail || "Login failed", "error");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Signup function
    const signup = async (email: string, username: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await signupMutation.mutateAsync({ email, username, password });
            setUser(response.data as User);
            localStorage.setItem("user", JSON.stringify(response.data));
            router.push("/dashboard"); // Redirect to dashboard after signup
        } catch (error) {
            console.error("Signup failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem("user");
        setUser(null);
        router.push("/");
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
