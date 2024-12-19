"use server";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import AuthLayout from "./pages/auth/AuthLayout";
import Login from "./pages/auth/Login";
import CreateAccount from "./pages/auth/CreateAccount";
import { useAppSelector } from "./redux/hooks";
import React, { useEffect } from "react";
import { useCookies } from "react-cookie";

export default function App() {
  // Get the token from the cookie
  const [cookies, _] = useCookies(["token"]);
  // Get the token from the store
  const { token } = useAppSelector((state) => state.auth);

  const [authenticated, setAuthenticated] = React.useState(false);

  useEffect(() => {
    // Check whether the token is the same as the one in the cookie
    if (cookies.token === token) {
      // If the token is the same, set the authenticated state to true
      setAuthenticated(true);
    }
  }, [token]);

  return (
    <Router>
      <Routes>
        {!authenticated ? (
          <Route
            path="/"
            element={
              <AuthLayout>
                <Outlet />
              </AuthLayout>
            }
          >
            <Route index element={<Login />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<CreateAccount />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Route>
        ) : (
          <Route path="/" element={<Outlet />}>
            <Route index element={<h1>Home</h1>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
}
