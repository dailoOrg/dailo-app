'use client'

import { useEffect } from 'react'

export function ErudaInit() {
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            // Add console log to verify the code is running
            console.log('Attempting to load Eruda...');

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/eruda';
            script.async = true;

            // Add error handling
            script.onerror = (error) => {
                console.error('Failed to load Eruda:', error);
            };

            script.onload = () => {
                // Verify eruda exists in window
                if (typeof window.eruda !== 'undefined') {
                    console.log('Eruda loaded, initializing...');
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
                    console.log('Eruda initialized!');
                } else {
                    console.error('Eruda failed to load properly');
                }
            };

            // Add script to head instead of body for faster loading
            document.head.appendChild(script);

            return () => {
                if (document.head.contains(script)) {
                    document.head.removeChild(script);
                }
                // Cleanup Eruda when component unmounts
                if (typeof window.eruda !== 'undefined') {
                    window.eruda.destroy();
                }
            };
        }
    }, []);

    return null;
} 