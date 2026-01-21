import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

export const LoginButton: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { signInWithGoogle, user, loading } = useAuth();

    if (loading) return null;

    if (user) return null; // Or return a specialized user badge if preferred in this context, but typically this button is for login

    return (
        <button
            onClick={signInWithGoogle}
            className={`flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium ${className}`}
        >
            <LogIn size={18} />
            <span>Sign in with Google</span>
        </button>
    );
};
