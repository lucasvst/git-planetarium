import { Link, Outlet } from 'react-router'

import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/', current: false },
  { name: 'Settings', href: '/settings', current: false },
]

export default function Full () {
  return (
    <div className="min-h-full">
      <nav>
        {navigation.map((item) => (
          <Button
            asChild
            key={item.name}
          >
            <Link to={item.href}>{item.name}</Link>
          </Button>
        ))}
      </nav>

      <header className="relative bg-gray-800 after:pointer-events-none after:absolute after:inset-x-0 after:inset-y-0 after:border-y after:border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">Planetarium</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"><Outlet /></div>
      </main>
    </div>
  )
}
