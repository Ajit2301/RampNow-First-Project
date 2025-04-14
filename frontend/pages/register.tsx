import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import '../src/app/globals.css';

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset messages
    setError("");
    setSuccess("");

    // Validation checks
    if (email === "admin@gmail.com") {
      setError("Registration with admin@gmail.com is not allowed.");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters long and include at least one number and one special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Check if email already exists
      const response = await axios.post("http://localhost:8080/check-email", { email });
      if (response.data.exists) {
        setError("Email is already registered. Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000); // Redirect to login after 2 seconds
        return;
      }

      // Check if user is authorized to register
      const response2 = await axios.post("http://localhost:8080/check-email-exists", { email });
      if (!response2.data.exists) {
        setError("You are not authorized to register as you are not a member.");
        return;
      }

      // API call to register user if email does not exist and user is authorized to register
      await axios.post("http://localhost:8080/register", { email, password });
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000); // Redirect after 2 seconds
    } catch (err) {
      console.error("Error registering users:", err); // Log the error
      setError("Error registering user. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-center text-2xl font-semibold mb-6 text-gray-800">Register</h2>
        
        <div className="mb-6">
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

        <div className="mb-6">
          <label className="block text-gray-600 mb-2">Confirm Password</label>
          <input
            type="password"
            className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        {success && <p className="text-green-600 text-center mb-4">{success}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Register
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
        </div>
      </form>
    </div>
  );
};

export default Register;
