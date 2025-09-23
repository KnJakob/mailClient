import { FreshmanCard } from '@/components/freshman-card'
import { getFreshmanText } from '@/lib/freshman'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/freshman')({
  component: RouteComponent,
  loader: async() => await getFreshmanText(),
})

function RouteComponent() {
  const data = Route.useLoaderData()
  return (
    <div>
      <FreshmanCard content={data} collapsed={false} />
    </div>
  )
}
