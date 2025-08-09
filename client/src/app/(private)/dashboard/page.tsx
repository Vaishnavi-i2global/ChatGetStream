"use client";

import { useAuth } from "@/providers/auth.provider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";
import Link from "next/link";

export default function DashboardPage() {
    const { user, logout } = useAuth();

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <div className="flex items-center">
                            <Image
                                src="/next.svg"
                                alt="Logo"
                                width={100}
                                height={24}
                                className="mr-4"
                            />
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Welcome, {user?.username}</span>
                            <button
                                onClick={logout}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Your Account</h2>
                            <div className="border-t border-gray-200 pt-4">
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Username</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{user?.username}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Account ID</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{user?.id}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        <div className="mt-6 bg-white shadow rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <Link href="/" className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100">
                                    <h3 className="text-lg font-medium text-blue-700">Home</h3>
                                    <p className="mt-1 text-sm text-blue-500">Return to homepage</p>
                                </Link>
                                <div className="block p-4 bg-green-50 rounded-lg hover:bg-green-100">
                                    <h3 className="text-lg font-medium text-green-700">Profile</h3>
                                    <p className="mt-1 text-sm text-green-500">Edit your profile</p>
                                </div>
                                <div className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100">
                                    <h3 className="text-lg font-medium text-purple-700">Settings</h3>
                                    <p className="mt-1 text-sm text-purple-500">Manage your account settings</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
