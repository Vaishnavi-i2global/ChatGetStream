import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard - Auth System",
    description: "User dashboard for the authentication system",
};

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <>{children}</>;
}
