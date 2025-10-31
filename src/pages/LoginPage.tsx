import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import bgImage from "../assets/login-bg.jpg";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        "https://student-management-backend-production-2b4a.up.railway.app/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        login(data.token);
        window.location.hash = "dashboard";
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    
        <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      <form
        onSubmit={handleLogin}
        className="bg-white/80 backdrop-blur-md w-full max-w-sm sm:max-w-md md:max-w-lg p-8 rounded-2xl shadow-lg flex flex-col items-center"
      >
        <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">
          Teacher Login
        </h2>

        {error && <p className="text-red-500 mb-3 text-sm text-center">{error}</p>}

        <div className="w-full mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none p-2 rounded-md w-full"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="w-full mb-6">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none p-2 rounded-md w-full"
            placeholder="Enter your password"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold px-6 py-2 rounded-md w-full shadow-md"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
