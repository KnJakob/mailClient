import { TrainingCard } from '@/components/training-card'
import { getTrainingTimes } from '@/lib/training-times'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/training-times')({
  component: RouteComponent,
  loader: async() => await getTrainingTimes(),
})

function RouteComponent() {
  const data = Route.useLoaderData()
  return (
    <div>
      <TrainingCard content={data} collapsed={false} />
    </div>
  )
}
