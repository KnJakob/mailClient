import { TrainingCard } from '@/components/training-card'
import { getTrainingTimes } from '@/lib/training-times'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/mails')({
  component: RouteComponent,
  loader: async() => await getTrainingTimes(),
})

function RouteComponent() {
  const data = Route.useLoaderData()

  return (
    <div>
      <TrainingCard content={data} /> 
    </div>
  )
}
