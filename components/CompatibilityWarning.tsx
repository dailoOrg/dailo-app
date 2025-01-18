import { X } from 'lucide-react';
import { getiOSVersion, isSafari } from '@/utils/browserDetection';

interface CompatibilityWarningProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CompatibilityWarning = ({ isOpen, onClose }: CompatibilityWarningProps) => {
    if (!isOpen) return null;

    const iOSVersion = getiOSVersion();
    const isSafariBrowser = isSafari();

    // Get current URL to suggest opening in Chrome
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const chromeUrl = `googlechrome://${currentUrl.replace(/^https?:\/\//, '')}`;

    let message = '';
    let actionButton = null;

    if (iOSVersion !== null) { // is iOS device
        if (iOSVersion < 18) {
            message = 'Voice recording might not work on iOS versions below 18. You can still try, or update your device for better compatibility.';
            actionButton = (
                <a
                    href="https://support.apple.com/en-us/HT204204"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-500 block"
                >
                    How to update iOS
                </a>
            );
        } else if (isSafariBrowser) {
            message = 'Voice recording might not work well in Safari. For best results, please use Chrome browser.';
            actionButton = (
                <div className="mt-4 space-y-2">
                    <a
                        href={chromeUrl}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500 block"
                    >
                        Open in Chrome
                    </a>
                    <a
                        href="https://apps.apple.com/us/app/google-chrome/id535886823"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:text-blue-500 block"
                    >
                        Download Chrome for iOS
                    </a>
                </div>
            );
        }
    }

    if (!message) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Compatibility Notice
                        </h3>
                        <p className="text-sm text-gray-600">
                            {message}
                        </p>
                        {actionButton}
                        <button
                            onClick={onClose}
                            className="mt-4 text-sm font-medium text-gray-500 hover:text-gray-400 block"
                        >
                            Continue anyway
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}; 