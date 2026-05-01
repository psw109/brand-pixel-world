import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "관리자",
    template: "%s · BPW 관리자",
  },
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">{children}</div>
  );
}
