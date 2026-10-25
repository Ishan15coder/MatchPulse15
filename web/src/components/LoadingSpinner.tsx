export default function LoadingSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3" role="status" aria-label={label}>
      <svg
        className="w-8 h-8 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12" cy="12" r="10"
          stroke="#10b981"
          strokeWidth="3"
        />
        <path
          className="opacity-75"
          fill="#10b981"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );
}
