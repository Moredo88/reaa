'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { ChevronRight } from 'lucide-react'

interface SidebarNavLinkProps {
  href: string
  nome: string
  hoverClass: string
}

// Client so por causa do usePathname: precisa saber a rota atual para
// destacar o link ativo. O resto do Sidebar continua Server Component.
export default function SidebarNavLink({ href, nome, hoverClass }: SidebarNavLinkProps) {
  const pathname = usePathname()
  const ativo = pathname === href

  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        ativo ? 'bg-slate-100 text-slate-900' : clsx('text-slate-600', hoverClass)
      )}
    >
      <span className="truncate">{nome}</span>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
    </Link>
  )
}
