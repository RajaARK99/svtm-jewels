import { orpc } from '@/orpc/client'
import {  useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'



export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { data } = useSuspenseQuery(orpc.listTodos.queryOptions())

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 grid place-content-center text-white">
      Hello World
      {data?.map((todo) => (
        <div key={todo.id}>{todo.name}</div>
      ))}
    </div>
  )
}
