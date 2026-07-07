import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { auth, apiErrorMessage } from "../services/api";
import "./Dashboard.css"; // reuse the existing .spinner class for the loading button state


function Login() {

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {

    e.preventDefault();

    const reg = e.target.reg.value.trim();
    const pass = e.target.pass.value.trim();

    if (!reg || !pass) {
      setError("Please fill all fields!");
      return;
    }

    setLoading(true);
    setError("");

    try {

      const res = await api.post("/api/auth/login", {
        regNumber: reg,
        password: pass,
      });

      // Store auth data (access token, refresh token, and user profile)
      auth.setSession(res.data.data);

      navigate("/dashboard");

    } catch (err) {
      setError(apiErrorMessage(err, "Invalid Reg Number or Password!"));
      setLoading(false);
    }
    // Deliberately not resetting `loading` on success - the navigate() away
    // means this component unmounts anyway, and keeping the button disabled/
    // spinning until then avoids a double-submit while the redirect happens.
  };

  return (
    <div className="F">

      <form className="L" onSubmit={handleLogin}>

        <div className="login-brand">CC</div>

        <h2>Campus Connect</h2>
        <p className="login-subtitle">Sign in to your account</p>

        <div className="login-field">
          <label htmlFor="reg">Registration Number</label>
          <input
            id="reg"
            type="text"
            name="reg"
            placeholder="e.g. SA001"
            autoComplete="username"
            disabled={loading}
          />
        </div>

        <div className="login-field">
          <label htmlFor="pass">Password</label>
          <input
            id="pass"
            type="password"
            name="pass"
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={loading}
          />
        </div>

        {error && <div id="result">{error}</div>}

        <button type="submit" className="result" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span>
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>

      </form>

    </div>
  );
}

export default Login;
