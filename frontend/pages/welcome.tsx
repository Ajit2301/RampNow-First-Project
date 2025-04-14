'use client';
import { useRouter } from "next/navigation";
import "../src/app/globals.css";

const Welcome = () => {
  const router = useRouter();

  const navigateToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 to-purple-200 text-center px-4">
      <h1 className="text-5xl font-extrabold text-blue-900 mb-6 drop-shadow-lg">
        Welcome to the Admin Dashboard
      </h1>
      <p className="text-gray-700 text-lg mb-6">
        Click below to login
      </p>
      <button
        onClick={navigateToLogin}
        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md"
      >
        Login
      </button>
    </div>
  );
};

export default Welcome;
