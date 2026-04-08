import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { verifyOTP, resendOTP } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft } from "lucide-react";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const email = location.state?.email;
  const password = location.state?.password;

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // if (!otp || otp.length !== 6) {
    //   setError("Enter a valid 6-digit OTP");
    //   return;
    // }

    try {
      setIsLoading(true);

      await verifyOTP({ email, otp });

      await login(email, password);

      navigate("/dashboard");

    } catch (err) {
      console.log(err)
      setError(err?.detail || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");

    try {
      setIsResending(true);

      await resendOTP({ email });

      setSuccess("OTP resent successfully");

    } catch (err) {
      console.log(err)
      setError(err?.detail || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4 font-sans">
      <div className="w-full max-w-md">

        <div className="text-center mb-8 relative">
          <Link
            to="/register"
            className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-500 flex items-center gap-1 text-sm"
          >
            <ArrowLeft size={16} /> Back
          </Link>

          <Link to="/" className="text-2xl font-semibold text-stone-900">
            Craftit
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Verify your email
            </CardTitle>
            <CardDescription className="text-center">
              Code sent to <b>{email}</b>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">

              {error && <ErrorMessage message={error} />}

              {success && (
                <div className="text-green-600 text-sm text-center">
                  {success}
                </div>
              )}

              <Input
                label="OTP"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ""))
                }
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                Verify & Continue
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              Didn’t receive OTP?{" "}
              <button onClick={handleResend} disabled={isResending}>
                {isResending ? "Sending..." : "Resend"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}