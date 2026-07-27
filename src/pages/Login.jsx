import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await fetch(
        "https://kt-backend-1.onrender.com/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            login: email, // backend expects login
            password,
          }),
        }
      );

      const data = await response.json();
      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Save token
      localStorage.setItem("token", data.token);

      // Save user data
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      localStorage.setItem(
        "isAuthenticated",
        "true"
      );

      setIsAuthenticated(true);
      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.log(error);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to access the admin dashboard
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Enter email"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white disabled:bg-gray-400"
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;