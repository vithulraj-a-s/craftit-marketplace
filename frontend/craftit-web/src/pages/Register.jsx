import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { registerUser } from "../services/authService";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState(location.state?.role || "ARTIST");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !role) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);

      await registerUser({
        email,
        password,
        role,
      });

      navigate("/verify-otp", {
        state: { email, password },
      });

    } catch (err) {
      console.log(err)
      setError(err?.email || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="text-2xl font-semibold text-stone-900 tracking-tight hover:opacity-80 transition-opacity"
          >
            Craftit
          </Link>
        </div>

        <Card className="shadow-xl shadow-stone-200/50 border-stone-200/60">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Create an Account
            </CardTitle>
            <CardDescription className="text-center">
              Join as {role === "ARTIST" ? "an Artist" : "a Client"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <ErrorMessage message={error} />}

              <div className="flex gap-2 mb-6 bg-stone-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setRole("ARTIST")}
                  className={`flex-1 py-2 rounded-md ${
                    role === "ARTIST"
                      ? "bg-white shadow font-medium"
                      : "text-stone-500"
                  }`}
                >
                  Artist
                </button>

                <button
                  type="button"
                  onClick={() => setRole("CLIENT")}
                  className={`flex-1 py-2 rounded-md ${
                    role === "CLIENT"
                      ? "bg-white shadow font-medium"
                      : "text-stone-500"
                  }`}
                >
                  Client
                </button>
              </div>

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />

              <Button
                type="submit"
                className="w-full bg-stone-900 text-white"
                isLoading={isLoading}
              >
                Sign up
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-sm text-stone-500">
              Already have an account?{" "}
              <Link to="/login" className="underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}