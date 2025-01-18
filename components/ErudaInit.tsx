'use client'

import { useEffect } from 'react'

export function ErudaInit() {
    useEffect(() => {
        // Following Eruda's recommended implementation
        const src = '//cdn.jsdelivr.net/npm/eruda';

        // Only load if eruda=true is in URL or localStorage has it enabled
        if (!/eruda=true/.test(window.location.href) &&
            localStorage.getItem('active-eruda') !== 'true') {
            return;
        }

        console.log('Eruda condition met, loading...');

        const script = document.createElement('script');
        script.src = src;
        script.async = true;

        script.onload = () => {
            if (typeof window.eruda !== 'undefined') {
                window.eruda.init({
                    tool: ['console', 'elements', 'network', 'resources', 'info'],
                    useShadowDom: true,
                    autoScale: true,
                    defaults: {
                        displaySize: 50,
                        transparency: 0.9,
                        theme: 'Dark'
                    }
                });
                console.log('Eruda initialized successfully');
            }
        };

        document.head.appendChild(script);

        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
            if (typeof window.eruda !== 'undefined') {
                window.eruda.destroy();
            }
        };
    }, []);

    return null;
} 