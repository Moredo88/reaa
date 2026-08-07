import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
}

export default function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="mb-3 text-slate-300">
        {icon || <Inbox className="h-10 w-10" />}
      </div>
      <h3 className="text-sm font-medium text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-slate-500">{description}</p>
      )}
    </div>
  )
}
