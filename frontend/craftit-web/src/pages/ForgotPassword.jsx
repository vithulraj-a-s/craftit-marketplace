import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import {
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} from "../services/authService";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Enter your email");
      return;
    }

    try {
      setIsLoading(true);

      await forgotPassword({ email });

      setStep(2);

    } catch (err) {
      console.log(err);
      setError(err?.response?.data?.detail || err?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp) {
      setError("Enter OTP");
      return;
    }

    try {
      setIsLoading(true);

      await verifyResetOTP({ email, otp });

      setStep(3);

    } catch (err) {
      console.log(err);
      setError(err?.response?.data?.detail || err?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword) {
      setError("Enter new password");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password too short");
      return;
    }

    try {
      setIsLoading(true);

      await resetPassword({
        email,
        new_password: newPassword,
      });

      setStep(4);

    } catch (err) {
      console.log(err);
      setError(err?.response?.data?.detail || err?.message || "Reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8 relative">
          {step < 4 && (
            <button
              onClick={() =>
                step === 1 ? navigate("/login") : setStep(step - 1)
              }
              className="absolute left-0 top-1/2 -translate-y-1/2 text-sm"
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}

          <Link to="/" className="text-2xl font-semibold">
            Craftit
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {step === 1 && "Reset Password"}
              {step === 2 && "Verify OTP"}
              {step === 3 && "New Password"}
              {step === 4 && "Done"}
            </CardTitle>

            <CardDescription className="text-center">
              {step === 1 && "Enter your email"}
              {step === 2 && `OTP sent to ${email}`}
              {step === 3 && "Enter new password"}
              {step === 4 && "Password reset successful"}
            </CardDescription>
          </CardHeader>

          <CardContent>

            {error && <ErrorMessage message={error} />}

            {step === 1 && (
              <form onSubmit={handleSendEmail}>
                <Input
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button type="submit" isLoading={isLoading}>
                  Send OTP
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOTP}>
                <Input
                  label="OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, ""))
                  }
                />
                <Button type="submit" isLoading={isLoading}>
                  Verify OTP
                </Button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword}>
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button type="submit" isLoading={isLoading}>
                  Reset Password
                </Button>
              </form>
            )}

            {step === 4 && (
              <div className="text-center space-y-4">
                <CheckCircle2 className="mx-auto text-green-500" size={40} />
                <Button onClick={() => navigate("/login")}>
                  Go to Login
                </Button>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}