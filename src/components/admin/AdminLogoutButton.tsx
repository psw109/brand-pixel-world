"use client";

export function AdminLogoutButton() {
  return (
    <button
      type="button"
      className="text-sm text-zinc-500 underline-offset-4 hover:text-zinc-800 hover:underline"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        window.location.href = "/admin/login";
      }}
    >
      로그아웃
    </button>
  );
}
