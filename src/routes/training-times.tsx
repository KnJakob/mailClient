import { TrainingCard } from '@/components/training-card'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/training-times')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <TrainingCard />
    </div>
  )
}
