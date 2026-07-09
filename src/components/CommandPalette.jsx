import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/api";

/**
 * Global ⌘K / Ctrl+K palette. Purely a navigation shortcut — no business logic.
 * Route list mirrors App.jsx exactly. Role gating mirrors each <ProtectedRoute>.
 */

const ALL_COMMANDS = [
  // Public
  { id: "home",       label: "Home",                  path: "/",                hint: "Public",  keywords: "landing start" },
  { id: "events",     label: "Browse Events",         path: "/events",          hint: "Public",  keywords: "list search" },
  { id: "calendar",   label: "Event Calendar",        path: "/calendar",        hint: "Public",  keywords: "schedule month" },
  { id: "login",      label: "Login",                 path: "/login",           hint: "Public",  keywords: "sign in",       when: (s) => !s.loggedIn },
  { id: "forgot",     label: "Forgot Password",       path: "/forgot-password", hint: "Public",  keywords: "reset",         when: (s) => !s.loggedIn },

  // Any authenticated user
  { id: "dashboard",     label: "Dashboard",         path: "/dashboard",     hint: "You",   keywords: "home overview", when: (s) => s.loggedIn },
  { id: "notifications", label: "Notifications",     path: "/notifications", hint: "You",   keywords: "alerts inbox",  when: (s) => s.loggedIn },

  // Organizer
  { id: "organizer",    label: "My Events (Organizer)", path: "/organizer",     hint: "Organizer", keywords: "manage mine",
    when: (s) => s.role === "STUDENT_ORGANIZER" || s.role === "SUPER_ADMIN" },
  { id: "create-event", label: "Create Event",          path: "/create-event",  hint: "Organizer", keywords: "new draft add",
    when: (s) => s.role === "STUDENT_ORGANIZER" || s.role === "SUPER_ADMIN" },

  // Admin / Faculty
  { id: "users",   label: "Manage Users",              path: "/users",            hint: "Admin",   keywords: "people accounts",
    when: (s) => ["SUPER_ADMIN","FACULTY_COORDINATOR"].includes(s.role) },
  { id: "venues",  label: "Manage Venues",             path: "/venues",           hint: "Admin",   keywords: "rooms halls",
    when: (s) => ["SUPER_ADMIN","FACULTY_COORDINATOR"].includes(s.role) },
  { id: "depts",   label: "Manage Departments",        path: "/departments",      hint: "Admin",   keywords: "dept",
    when: (s) => s.role === "SUPER_ADMIN" },
  { id: "clubs",   label: "Manage Clubs",              path: "/clubs",            hint: "Admin",   keywords: "society",
    when: (s) => ["SUPER_ADMIN","FACULTY_COORDINATOR"].includes(s.role) },
  { id: "cats",    label: "Manage Event Categories",   path: "/event-categories", hint: "Admin",   keywords: "types tag",
    when: (s) => ["SUPER_ADMIN","FACULTY_COORDINATOR"].includes(s.role) },
  { id: "reports", label: "Reports",                   path: "/reports",          hint: "Admin",   keywords: "analytics stats",
    when: (s) => ["SUPER_ADMIN","FACULTY_COORDINATOR","HOD"].includes(s.role) },
];

function score(cmd, q) {
  if (!q) return 1;
  const hay = (cmd.label + " " + (cmd.keywords || "") + " " + cmd.path).toLowerCase();
  const needle = q.toLowerCase().trim();
  if (!needle) return 1;
  if (hay.startsWith(needle)) return 3;
  if (hay.includes(needle)) return 2;
  // fuzzy: all chars in order
  let i = 0;
  for (const ch of hay) if (ch === needle[i]) i++;
  return i === needle.length ? 1 : 0;
}

export default function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);

  const session = useMemo(() => ({
    loggedIn: auth.isLoggedIn(),
    role: (typeof window !== "undefined" && localStorage.getItem("role")) || "",
  }), [open]);

  const results = useMemo(() => {
    return ALL_COMMANDS
      .filter((c) => !c.when || c.when(session))
      .map((c) => ({ c, s: score(c, q) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 12)
      .map((r) => r.c);
  }, [q, session]);

  useEffect(() => {
    const onKey = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (!open) return;
      if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
      if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, results.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && results[idx]) {
        e.preventDefault();
        const target = results[idx];
        setOpen(false); setQ(""); setIdx(0);
        navigate(target.path);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, idx, navigate]);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 10); }, [open]);
  useEffect(() => { setIdx(0); }, [q, open]);

  if (!open) return null;

  return (
    <div
      className="qw-cmdk-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div className="qw-cmdk">
        <div className="qw-cmdk-input-row">
          <span className="qw-cmdk-icon" aria-hidden>⌕</span>
          <input
            ref={inputRef}
            className="qw-cmdk-input"
            placeholder="Search pages…  (Esc to close)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <kbd className="qw-cmdk-kbd">Esc</kbd>
        </div>

        <ul className="qw-cmdk-list" role="listbox">
          {results.length === 0 && (
            <li className="qw-cmdk-empty">No matches for “{q}”.</li>
          )}
          {results.map((r, i) => (
            <li
              key={r.id}
              role="option"
              aria-selected={i === idx}
              className={"qw-cmdk-item" + (i === idx ? " qw-cmdk-item-active" : "")}
              onMouseEnter={() => setIdx(i)}
              onMouseDown={(e) => { e.preventDefault(); setOpen(false); setQ(""); navigate(r.path); }}
            >
              <div className="qw-cmdk-label">{r.label}</div>
              <div className="qw-cmdk-meta">
                <span className="qw-cmdk-path">{r.path}</span>
                {r.hint && <span className="qw-cmdk-hint">{r.hint}</span>}
              </div>
            </li>
          ))}
        </ul>

        <div className="qw-cmdk-footer">
          <span><kbd className="qw-cmdk-kbd">↑</kbd><kbd className="qw-cmdk-kbd">↓</kbd> navigate</span>
          <span><kbd className="qw-cmdk-kbd">↵</kbd> open</span>
          <span><kbd className="qw-cmdk-kbd">⌘</kbd><kbd className="qw-cmdk-kbd">K</kbd> toggle</span>
        </div>
      </div>
    </div>
  );
}
