import Link from 'next/link'
import { LogOut, Users } from 'lucide-react'

interface HeaderProps {
  email: string
  nome: string
  isAdmin: boolean
}

export default function Header({ email, nome, isAdmin }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="text-xl font-bold tracking-tight text-slate-900">REAA</span>
          <span className="hidden text-sm text-slate-500 sm:inline">
            Rito Escocês Antigo e Aceito
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="hidden max-w-[16rem] truncate text-sm text-slate-500 md:inline">
            {nome || email}
          </span>

          {isAdmin && (
            <Link
              href="/admin/usuarios"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Usuários</span>
            </Link>
          )}

          <a
            href="/auth/signout"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </a>
        </div>
      </div>
    </header>
  )
}
