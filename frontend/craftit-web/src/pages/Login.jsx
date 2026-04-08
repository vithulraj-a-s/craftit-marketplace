import { resendOTP } from "../services/authService";
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
import { useAuth } from "../context/AuthContext";
import { ArrowLeft } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerifyOption, setShowVerifyOption] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);

      const user = await login(email, password);

      if (!user.is_verified) {
        navigate("/verify-otp", { state: { email } });
        return;
      }

      if (user.role === "artist") {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.log(err)
      console.log(err.detail)

      if(err?.code == "not_verified"){
        setError("Account is not verified. Please verify ")
        setShowVerifyOption(true)
      }else{
        setError(err.detail || "Login failed");
      }

    } finally {
      setIsLoading(false);
    }
  };


const handleVerifyRedirect = async () => {
  try {
    setIsLoading(true);

    await resendOTP({ email });

    navigate("/verify-otp", {
      state: { email, password },
    });

  } catch (err) {
    setError(err?.detail || "Failed to send verification email");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4 font-sans">
      <div className="w-full max-w-md">

        <div className="text-center mb-8 relative">
          <Link
            to="/"
            className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1 text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back
          </Link>

          <Link
            to="/"
            className="text-2xl font-semibold text-stone-900 tracking-tight hover:opacity-80 transition-opacity"
          >
            Craftit
          </Link>
        </div>

        <Card className="shadow-xl shadow-stone-200/50 border-stone-200/60">
          <CardHeader>
            <CardTitle className="text-2xl font-medium text-center">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center">
              Please sign in to your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              {error && <ErrorMessage message={error} />}

              {showVerifyOption && (
                  <button
                      onClick={handleVerifyRedirect}
                      className="text-sm text-orange-600 underline mt-2"
                      >
                        Verify your account now to continue
                  </button>
                  )}

              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-stone-700">
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-stone-900 text-stone-50 hover:bg-stone-800"
                isLoading={isLoading}
              >
                Sign in
              </Button>

            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-stone-100 pt-6">
            <p className="text-sm text-stone-500">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-stone-900 underline hover:text-orange-600 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}