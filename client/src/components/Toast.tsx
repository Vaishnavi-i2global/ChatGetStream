"use client";

import { useEffect, useState } from "react";

interface ToastProps {
    message: string;
    type: "success" | "error" | "info";
    duration?: number;
    onClose: () => void;
}

export default function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Allow time for animation before removing
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColor =
        type === "success" ? "bg-green-500" :
            type === "error" ? "bg-red-500" :
                "bg-blue-500";

    return (
        <div
            className={`fixed top-4 right-4 p-4 rounded-md text-white shadow-lg transition-opacity duration-300 ${bgColor} ${isVisible ? "opacity-100" : "opacity-0"
                }`}
        >
            <div className="flex items-center">
                {type === "success" && (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                )}
                {type === "error" && (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                )}
                {type === "info" && (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                )}
                <span>{message}</span>
            </div>
        </div>
    );
}

// Toast container to manage multiple toasts
interface Toast {
    id: string;
    message: string;
    type: "success" | "error" | "info";
}

export function ToastContainer() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    // Function to add a new toast
    const addToast = (message: string, type: "success" | "error" | "info") => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    };

    // Function to remove a toast
    const removeToast = (id: string) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    };

    return (
        <>
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </>
    );
}
