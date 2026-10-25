interface ErrorCardProps {
  message: string;
}

export default function ErrorCard({ message }: ErrorCardProps) {
  return (
    <div
      className="card flex items-start gap-4 border-red-500/30"
      role="alert"
      aria-live="assertive"
    >
      <span className="text-2xl" aria-hidden="true">⚠️</span>
      <div>
        <p className="font-semibold text-red-400 mb-1">Could not load data</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          Make sure the API is running at{' '}
          <code className="font-mono">{import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}</code>.
        </p>
      </div>
    </div>
  );
}
