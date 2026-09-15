import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-red-600 mb-4">401 - Unauthorized</h1>
      <p className="text-lg text-gray-700 mb-8">You must be logged in to view this page.</p>
      <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
        Go to Login
      </Link>
    </div>
  );
}
