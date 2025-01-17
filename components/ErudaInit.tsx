'use client'

import { useEffect } from 'react'

export function ErudaInit() {
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/eruda';
            script.async = true;
            script.onload = () => {
                // @ts-ignore - eruda will be available globally
                window.eruda.init();
            };
            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        }
    }, []);

    return null;
} 