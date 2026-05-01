type Props = {
  /** 모바일에서 햄버거로 네비 열기 */
  onOpenNav?: () => void;
};

export function AdminTopBar({ onOpenNav }: Props) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white px-2 sm:px-4 dark:border-zinc-800 dark:bg-zinc-950 md:h-14">
      <div className="flex min-w-0 items-center gap-2">
        {onOpenNav ? (
          <button
            type="button"
            onClick={onOpenNav}
            className="inline-flex shrink-0 items-center justify-center rounded-md p-2 text-zinc-700 hover:bg-zinc-100 md:hidden dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label="메뉴 열기"
          >
            <span className="sr-only">메뉴</span>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center">
        <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
          Admin
        </span>
      </div>
    </header>
  );
}
