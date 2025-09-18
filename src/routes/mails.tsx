import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/mails')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/mails"!</div>
}
