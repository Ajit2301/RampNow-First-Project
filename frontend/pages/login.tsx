import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import "../src/app/globals.css";

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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/login", { email, password });
      const { token, user_data } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("email", email);
      if (email === "admin@gmail.com") {
        router.push("/dashboard");
      } else {
        router.push({
          pathname: "/user-dashboard",
          query: { user: JSON.stringify(user_data) },
        });
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.error || "Invalid credentials. Please try again.");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">
          Welcome to Admin Dashboard
        </h1>
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">
          Login
        </h2>

        <div className="mb-4">
          <label className="block text-gray-600 mb-2">Email</label>
          <input
            type="email"
            className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 mb-2">Password</label>
          <input
            type="password"
            className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Login
        </button>

        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-700">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-blue-500 hover:underline focus:outline-none"
            >
              Login here
            </button>
          </p>
          <p className="text-gray-700">
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="text-red-500 hover:underline focus:outline-none"
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
