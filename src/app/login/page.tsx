'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || 'Login failed');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error: unknown) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login to ACM</h2>
        
        {error && <div className="mb-4 text-red-500 text-sm p-2 bg-red-50 rounded" data-testid="error-message">{error}</div>}
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Username</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded focus:outline-blue-500" 
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            data-testid="username-input"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Password</label>
          <input 
            type="password" 
            className="w-full p-2 border rounded focus:outline-blue-500" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            data-testid="password-input"
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition"
          data-testid="login-button"
        >
          Login
        </button>
      </form>
    </div>
  );
}
