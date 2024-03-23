'use client'

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/command'
import { type Course } from '@prisma/client'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useDebounce } from 'use-debounce'

export interface SearchProps {
  searchPokedex: (
    content: string
  ) => Promise<Array<Course & { similarity: number }>>
}

export function Search({ searchPokedex }: SearchProps) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<
    Array<Course & { similarity?: number }>
  >([])
  const [debouncedQuery] = useDebounce(query, 150)
  useEffect(() => {
    let current = true
    if (debouncedQuery.trim().length > 0) {
      searchPokedex(debouncedQuery).then((results) => {
        if (current) {
          setSearchResults(results)
        }
      })
    }
    return () => {
      current = false
    }
  }, [debouncedQuery, searchPokedex])
  return (
    <div className="w-full">
      <Command label="Command Menu" shouldFilter={false} className="h-[200px]">
        <CommandInput
          id="search"
          placeholder="Tipo de curso..."
          className="focus:ring-0 sm:text-sm text-base focus:border-0 border-0 active:ring-0 active:border-0 ring-0 outline-0"
          value={query}
          onValueChange={(q) => setQuery(q)}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {searchResults.map((course) => (
            <CommandItem
              key={course.id}
              value={course.nombre}
              className="data-[selected='true']:bg-zinc-50  flex items-center justify-between py-3"
              onSelect={(p) => {
                console.log(p)
                toast.success(`You selected ${p}!`)
              }}
            >
              <div className="flex items-center space-x-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">
                    {course.nombre.substring(0, 90)}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {course.similarity ? (
                  <div className="text-xs font-mono p-0.5 rounded bg-zinc-100">
                    {course.similarity.toFixed(3)}
                  </div>
                ) : (
                  <div />
                )}
              </div>
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </div>
  )
}

Search.displayName = 'Search'
