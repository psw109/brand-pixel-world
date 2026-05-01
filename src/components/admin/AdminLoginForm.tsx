"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { safeAdminNextPath } from "@/lib/admin/safeNext";

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => safeAdminNextPath(searchParams.get("next")),
    [searchParams],
  );

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "로그인에 실패했습니다.");
        return;
      }
      window.location.assign(nextPath);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <div className="space-y-1">
        <label htmlFor="admin-id" className="text-sm font-medium text-zinc-800">
          아이디
        </label>
        <input
          id="admin-id"
          name="id"
          type="text"
          autoComplete="username"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none ring-zinc-400 focus:border-zinc-400 focus:ring-2"
          required
        />
      </div>
      <div className="space-y-1">
        <label
          htmlFor="admin-password"
          className="text-sm font-medium text-zinc-800"
        >
          비밀번호
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none ring-zinc-400 focus:border-zinc-400 focus:ring-2"
          required
        />
      </div>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {pending ? "확인 중…" : "로그인"}
      </button>
    </form>
  );
}
