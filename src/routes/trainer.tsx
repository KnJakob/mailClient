import { TrainerCard } from '@/components/trainer-card'
import { getTrainers } from '@/lib/trainer'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/trainer')({
  component: RouteComponent,
  loader: async() => await getTrainers(),
})

function RouteComponent() {
  const trainers = Route.useLoaderData()
  return (
    <div>
      <TrainerCard trainers={trainers} />
    </div>
  )
}