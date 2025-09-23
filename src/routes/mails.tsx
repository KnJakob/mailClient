import { TrainerCard } from '@/components/trainer-card'
import { TrainingCard } from '@/components/training-card'
import { getTrainingTimes } from '@/lib/training-times'
import { getTrainers } from '@/lib/trainer'
import { createFileRoute, Link } from '@tanstack/react-router'
import { FreshmanCard } from '@/components/freshman-card'
import { getFreshmanText } from '@/lib/freshman'

export const Route = createFileRoute('/mails')({
  component: RouteComponent,
  loader: async() => {
    const [trainingTimes, trainers, freshmanText] = await Promise.all([
      getTrainingTimes(),
      getTrainers(),
      getFreshmanText()
    ])
    return { trainingTimes, trainers, freshmanText }
  },
})

function RouteComponent() {
  const { trainingTimes, trainers, freshmanText } = Route.useLoaderData()

  return (
    <div className='w-64'>
      <TrainingCard content={trainingTimes} collapsed={true} />
      <TrainerCard trainers={trainers} />
      <FreshmanCard content={freshmanText} collapsed={true} />
    </div>
  )
}
