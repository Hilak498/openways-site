"use client";

import { useActionState } from "react";

import { loginAction, type ActionResult } from "@/app/crm/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    loginAction,
    null,
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="crm-password" className="mb-1 block text-sm font-semibold text-white">
          סיסמה
        </label>
        <input
          id="crm-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          dir="ltr"
          className="w-full rounded-lg border border-white/25 bg-navy-950/40 px-3 py-2.5 text-left text-white placeholder:text-white/40 focus:border-gold-300 focus:outline-none"
          placeholder="••••••••"
          aria-describedby={state && !state.ok ? "crm-login-error" : undefined}
        />
      </div>

      {state && !state.ok ? (
        <p
          id="crm-login-error"
          role="alert"
          className="rounded-lg bg-danger-300/15 px-3 py-2 text-sm font-semibold text-danger-300"
        >
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {pending ? "מתחבר…" : "כניסה"}
      </button>
    </form>
  );
}
