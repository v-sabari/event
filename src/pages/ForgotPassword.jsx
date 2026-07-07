import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { apiErrorMessage } from "../services/api";
import "./Dashboard.css"; // reuse the existing .spinner class, same as Login.jsx

// Three-step flow matching the three separate backend endpoints exactly:
//   1. POST /api/auth/forgot-password  { email }               -> always succeeds (no account enumeration)
//   2. POST /api/auth/verify-otp       { email, otp }           -> lets the user know immediately if the code is wrong
//   3. POST /api/auth/reset-password   { email, otp, newPassword } -> re-validates the OTP server-side and consumes it
// Steps 2 and 3 both send the OTP because that's what PasswordResetServiceImpl
// actually expects (verifyOtp() is a non-consuming check; resetPassword()
// independently re-validates and then marks it used) - splitting the OTP
// into a separate "verified" step client-side would just be double work for
// no extra safety, since the backend re-checks it anyway.
function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = email, 2 = otp, 3 = new password, 4 = done
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const submitEmail = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/forgot-password", { email: email.trim() });
      setInfo(res.data.message || "If an account exists for that email, an OTP has been sent.");
      setStep(2);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not process that request."));
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/auth/verify-otp", { email: email.trim(), otp: otp.trim() });
      setInfo("");
      setStep(3);
    } catch (err) {
      setError(apiErrorMessage(err, "Invalid or expired OTP."));
    } finally {
      setLoading(false);
    }
  };

  const submitNewPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setStep(4);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not reset your password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="F">
      <form
        className="L"
        onSubmit={step === 1 ? submitEmail : step === 2 ? submitOtp : submitNewPassword}
      >
        <div className="login-brand">CC</div>
        <h2>Reset Password</h2>

        {step === 1 && (
          <>
            <p className="login-subtitle">
              Enter the email associated with your account and we'll send you a one-time code.
            </p>
            <div className="login-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
                required
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="login-subtitle">
              {info || `Enter the code sent to ${email}.`}
            </p>
            <div className="login-field">
              <label htmlFor="otp">One-Time Code</label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                autoComplete="one-time-code"
                disabled={loading}
                required
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="login-subtitle">Choose a new password.</p>
            <div className="login-field">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
                required
              />
            </div>
            <div className="login-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
                required
              />
            </div>
          </>
        )}

        {step === 4 && (
          <p className="login-subtitle">
            Your password has been reset. You can now sign in with your new password.
          </p>
        )}

        {error && <div id="result">{error}</div>}

        {step !== 4 ? (
          <button type="submit" className="result" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                {step === 1 ? "Sending..." : step === 2 ? "Verifying..." : "Resetting..."}
              </>
            ) : step === 1 ? (
              "Send Code"
            ) : step === 2 ? (
              "Verify Code"
            ) : (
              "Reset Password"
            )}
          </button>
        ) : (
          <button type="button" className="result" onClick={() => navigate("/login")}>
            Back to Sign In
          </button>
        )}

        {step !== 4 && (
          <p className="login-subtitle" style={{ marginTop: 12 }}>
            <Link to="/login">Back to Sign In</Link>
          </p>
        )}
      </form>
    </div>
  );
}

export default ForgotPassword;
