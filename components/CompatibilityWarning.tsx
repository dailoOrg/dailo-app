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

    let message = '';
    if (iOSVersion !== null) { // is iOS device
        if (iOSVersion < 18) {
            message = 'Voice recording requires iOS 18 or later. Please update your device or use a different one.';
        } else if (isSafariBrowser) {
            message = 'Voice recording is not supported in Safari. Please use Chrome browser.';
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
                            Browser Compatibility Warning
                        </h3>
                        <p className="text-sm text-gray-600">
                            {message}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}; 