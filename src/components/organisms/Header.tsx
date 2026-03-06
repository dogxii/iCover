import { useTheme } from "../../hooks/useTheme";

// ─── Icons ────────────────────────────────────────────────────────────────────

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Icon mark */}
      <div
        className="flex items-center justify-center w-8 h-8 rounded-[10px] shrink-0"
        style={{
          background: "linear-gradient(135deg, #0064d1 0%, #5e5ce6 100%)",
          boxShadow: "0 2px 8px rgba(0, 100, 209, 0.35)",
        }}
        aria-hidden="true"
      >
        {/* Diagonal split icon */}
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          {/* Left half – light */}
          <clipPath id="logo-left">
            <polygon points="0,0 11,0 7,18 0,18" />
          </clipPath>
          <rect width="18" height="18" rx="3" fill="rgba(255,255,255,0.25)" clipPath="url(#logo-left)" />
          {/* Right half – dark */}
          <clipPath id="logo-right">
            <polygon points="11,0 18,0 18,18 7,18" />
          </clipPath>
          <rect width="18" height="18" rx="3" fill="rgba(255,255,255,0.08)" clipPath="url(#logo-right)" />
          {/* Diagonal line */}
          <line x1="11" y1="0" x2="7" y2="18" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
        </svg>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span
          className="text-[15px] font-bold tracking-tight"
          style={{ color: "var(--color-text)" }}
        >
          i<span style={{ color: "var(--color-primary)" }}>Cover</span>
        </span>
        <span
          className="text-[10px] font-medium"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Screenshot Merge
        </span>
      </div>
    </div>
  );
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { resolved, toggleTheme } = useTheme();
  const isDark = resolved === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "切换到亮色模式" : "切换到暗色模式"}
      title={isDark ? "切换到亮色模式" : "切换到暗色模式"}
      className={[
        "relative flex items-center justify-center w-8 h-8 rounded-full",
        "transition-all duration-200 cursor-pointer",
        "hover:bg-[var(--color-overlay)]",
        "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2",
        "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]",
      ].join(" ")}
    >
      {/* Icon swap with fade transition */}
      <span
        className="absolute transition-all duration-200"
        style={{
          opacity: isDark ? 0 : 1,
          transform: isDark ? "scale(0.7) rotate(-30deg)" : "scale(1) rotate(0deg)",
        }}
      >
        <MoonIcon />
      </span>
      <span
        className="absolute transition-all duration-200"
        style={{
          opacity: isDark ? 1 : 0,
          transform: isDark ? "scale(1) rotate(0deg)" : "scale(0.7) rotate(30deg)",
        }}
      >
        <SunIcon />
      </span>
    </button>
  );
}

// ─── Header Component ─────────────────────────────────────────────────────────

export function Header() {
  return (
    <header
      className="glass sticky top-0 z-50 w-full"
      style={{
        borderBottom: "1px solid var(--color-border)",
        borderRadius: 0,
      }}
      role="banner"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <Logo />

        {/* Right: Actions */}
        <nav
          className="flex items-center gap-1"
          aria-label="全局操作"
        >
          {/* GitHub link */}
          <a
            href="https://github.com/dogxi/icover"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="在 GitHub 上查看源码"
            title="GitHub"
            className={[
              "flex items-center justify-center w-8 h-8 rounded-full",
              "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]",
              "hover:bg-[var(--color-overlay)]",
              "transition-all duration-200",
              "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2",
            ].join(" ")}
          >
            <GithubIcon />
          </a>

          {/* Divider */}
          <div
            className="w-px h-4 mx-0.5 shrink-0"
            style={{ background: "var(--color-border)" }}
            aria-hidden="true"
          />

          {/* Theme toggle */}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
