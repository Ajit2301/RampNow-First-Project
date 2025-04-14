import { useRouter } from "next/router";
import "../src/app/globals.css";

const Welcome = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-md w-full">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Welcome to Admin Dashboard</h1>
        <p className="text-gray-700 text-lg mb-6">
          Manage users, track data, and control access easily.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-all"
        >
          Click here to Login
        </button>
      </div>
    </div>
  );
};

export default Welcome;
