// src/components/PasswordScreen.tsx
import React, { useState } from 'react';

interface PasswordScreenProps {
  onSuccess: () => void;
}

export const PasswordScreen: React.FC<PasswordScreenProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const correctPassword = '0823';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      setError('');
      onSuccess();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-sm">
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">Access Required</h1>
            <p className="text-sm text-gray-600 text-center mb-6">Please enter the password to continue.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="password-input" className="sr-only">Password</label>
                    <input
                        id="password-input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 text-center border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="••••"
                        autoFocus
                    />
                </div>
                {error && <p className="text-red-500 text-sm text-center font-semibold">{error}</p>}
                <button
                    type="submit"
                    className="w-full px-6 py-3 text-white font-bold rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 transition-transform transform hover:scale-105"
                >
                    Unlock
                </button>
            </form>
        </div>
    </div>
  );
};