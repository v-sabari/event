import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { auth, apiErrorMessage } from "../services/api";


function Login() {

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {

    e.preventDefault();

    const reg = e.target.reg.value.trim();
    const pass = e.target.pass.value.trim();

    if (!reg || !pass) {
      setError("Please fill all fields!");
      return;
    }

    try {

      const res = await api.post("/api/auth/login", {
        regNumber: reg,
        password: pass,
      });

      // Store auth data (access token, refresh token, and user profile)
      auth.setSession(res.data.data);

      setError("");
      navigate("/dashboard");

    } catch (err) {
      setError(apiErrorMessage(err, "Invalid Reg Number or Password!"));
    }
  };

  return (
    <div className="F">

      <form className="L" onSubmit={handleLogin}>

        <h2 style={{ marginBottom: "20px" }}>
          Campus Connect Login
        </h2>

        <div>
          Reg Number:
          <input
            type="text"
            name="reg"
            placeholder="Enter your Reg Number"
          />
        </div>

        <div>
          Password:
          <input
            type="password"
            name="pass"
            placeholder="Enter your Password"
          />
        </div>

        {error && <div id="result">{error}</div>}

        <button type="submit" className="result">
          Login
        </button>

      </form>

    </div>
  );
}

export default Login;
