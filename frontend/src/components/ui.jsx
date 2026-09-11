export function Spinner() {
  return (
    <div className="flex items-center justify-center py-10" data-testid="spinner">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
    </div>
  )
}

export function ErrorBanner({ message }) {
  return (
    <div className="my-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      {message}
    </div>
  )
}

export function EmptyState({ label }) {
  return (
    <div className="py-10 text-center text-sm text-gray-500" data-testid="empty-state">
      {label}
    </div>
  )
}