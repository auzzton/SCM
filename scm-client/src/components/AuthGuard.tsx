'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

const PUBLIC_PATHS = ['/login'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, token } = useAuthStore();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const isPublic = PUBLIC_PATHS.includes(pathname);

        if (!isAuthenticated() && !isPublic) {
            router.push('/login');
        } else if (isAuthenticated() && isPublic) {
            router.push('/dashboard');
        } else {
            setAuthorized(true);
        }
    }, [isAuthenticated, pathname, router, token]);

    if (!authorized) {
        return <div className="h-screen flex items-center justify-center">Loading...</div>; // Or a proper loading spinner
    }

    return <>{children}</>;
}
