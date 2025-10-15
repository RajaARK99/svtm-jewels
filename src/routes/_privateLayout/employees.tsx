import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_privateLayout/employees')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_privateLayout/employees"!</div>
}
