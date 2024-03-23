import { searchPokedex } from '@/app/actions'
import ExpandingArrow from '@/components/expanding-arrow'
import { Search } from '@/components/search'
import Image from 'next/image'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
      <h1 className="pt-4 pb-8 bg-gradient-to-br from-black via-[#171717] to-[#575757] bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
        Cursos y capacitaciones
      </h1>
      <div className="bg-white/30 p-6 lg:p-12 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">
              Busca el mejor curso para ti
            </h2>
          </div>
        </div>
        <div className="divide-y divide-gray-900/5">
          <Search searchPokedex={searchPokedex} />
        </div>
      </div>
    </main>
  )
}
