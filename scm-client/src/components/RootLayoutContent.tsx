'use client';

import { Sidebar } from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";

export default function RootLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isPublic = pathname === '/login';

    return (
        <AuthGuard>
            <div className="flex min-h-screen bg-gray-50">
                {!isPublic && <Sidebar />}
                <main className={`flex-1 overflow-auto ${!isPublic ? 'p-8' : ''}`}>
                    {children}
                </main>
            </div>
        </AuthGuard>
    );
}
