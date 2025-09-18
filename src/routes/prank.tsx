import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/prank')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Herzliches Pech! Du wurde miese geprankt. Hier ist nämlich noch garnichts..</div>
}
