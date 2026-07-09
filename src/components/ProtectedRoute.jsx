import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../services/api";

/**
 * FE-02: centralizes what was previously eleven near-identical
 * `useEffect(() => { if (![...roles].includes(role)) navigate("/login") }, [role])`
 * blocks copy-pasted across page components, and adds the same protection
 * from scratch to two pages that had none at all (EventRoster, Notifications).
 * Applied uniformly at the router level in App.jsx instead of inside each
 * page - if the auth model ever changes, there is exactly one place to
 * update, not eleven-plus.
 *
 * Every `allowedRoles` list passed in at each call site in App.jsx is
 * grounded in the corresponding backend @PreAuthorize rule (or lack of
 * one), not guessed - see the comment above each <Route> there.
 *
 * - Not logged in (no access token) -> /login, regardless of role.
 * - Logged in but role not in allowedRoles (when provided) -> /login,
 *   matching the exact redirect target every page already used, so this
 *   is a behavior-preserving refactor for the eleven pages that already
 *   had a check, not a UX change.
 * - allowedRoles omitted entirely -> any authenticated user is allowed.
 *   This is Notifications.jsx's case: NotificationController has no
 *   @PreAuthorize at all, it just scopes queries to currentUser.getId().
 */
function ProtectedRoute({ allowedRoles, children }) {
  const role = localStorage.getItem("role");

  if (!auth.isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;