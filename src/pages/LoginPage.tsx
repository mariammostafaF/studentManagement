import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import bgImage from "../assets/login-bg.jpg";
import logo from "../assets/logo.jpg"

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
        className="bg-white backdrop-blur-md w-full max-w-sm sm:max-w-md md:max-w-lg p-8 rounded-2xl shadow-lg flex flex-col items-center"
      >
      <div className="flex items-center justify-center mb-6 space-x-3">
        <img
          src={logo}
          alt="Logo"
          className="w-10 h-10 object-contain"
        />
        <h2 className="font-montserrat text-4xl font-bold text-black">
          Student Management
        </h2>
      </div>


        <h3 className="text-2xl text-black font-bold">SIGN IN</h3>

        <h4 className="text-gray-500">Enter your credentials to access your account</h4>
        <br></br>
        <br></br>

        {error && <p className="text-red-500 mb-3 text-sm text-center">{error}</p>}

        <div className="w-full mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-500">
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
          <label className="block mb-1 text-sm font-medium text-gray-500">
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
          className="transition-colors text-white px-6 py-2 rounded-md w-full shadow-md"
          style={{ backgroundColor: "#FEAF00" }}
        >
          SIGN IN
        </button>
        <br></br>
        <h4 className="text-gray-500">Forgot your password? <a href="#" style={{ color: "#FEAF00", textDecoration: "underline" }}>
          Reset Password
        </a>
        </h4>




      </form>
    </div>
  );
}
