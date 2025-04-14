import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect } from "react";
import '../src/app/globals.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/login", { email, password });
      const { token, user_data } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("email", email);
      if (email === "admin@gmail.com") {
        router.push("/dashboard"); // Redirect to admin dashboard
      } else {
        router.push({
          pathname: "/user-dashboard",
          query: { user: JSON.stringify(user_data) }, // Pass user data as a query parameter
        });
      }
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        // Custom message from backend or default fallback
        setError(err.response.data?.error || "Invalid credentials. Please try again.");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    }
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50"> {/* Light gray background */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-center text-2xl font-semibold mb-6 text-gray-800">Login</h2>
        
        <div className="mb-4">
          <label className="block text-gray-600 mb-2">Email</label>
          <input
            type="email"
            className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-600 mb-2">Password</label>
          <input
            type="password"
            className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Login
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-700">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-blue-500 underline"
            >
              Login here
            </button>
          </p>
          <p className="text-gray-700">
            Do not have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="text-red-500 underline"
            >
              Register here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
