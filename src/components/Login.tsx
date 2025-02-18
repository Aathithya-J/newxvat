import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { createUserProfile } from '../services/userService';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [error, setError] = useState<string>('');

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Create or update user profile in Firestore
      await createUserProfile(user);
      
      console.log('Logged in user:', user);
      onLogin();
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          XVAT<span className="text-indigo-500">.AI</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl">
          Your intelligent learning companion powered by artificial intelligence
        </p>
      </div>

      {/* Login Card */}
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl border border-gray-700">
        <div>
          <h2 className="mt-6 text-center text-2xl font-bold text-white">
            Get Started
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Join thousands of students enhancing their learning with AI
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 text-center text-sm text-gray-400">
            <div className="flex items-center justify-center space-x-2">
              <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Personalized Learning Experience</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Real-time Performance Analytics</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>24/7 AI-Powered Support</span>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="p-4 text-sm text-red-400 bg-red-900/50 rounded-lg">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-700 rounded-lg shadow-sm text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <FcGoogle className="h-5 w-5 mr-2" />
          Continue with Google
        </button>

        <div className="mt-6 text-center space-y-4">
          <p className="text-sm text-gray-400">
            By signing in, you agree to our{' '}
            <a href="#" className="font-medium text-indigo-400 hover:text-indigo-300">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-medium text-indigo-400 hover:text-indigo-300">
              Privacy Policy
            </a>
          </p>
          <div className="pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-500">
              © 2025 XVAT.AI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
