import { TrainerCard } from '@/components/trainer-card'
import { TrainingCard } from '@/components/training-card'
import { getTrainingTimes } from '@/lib/training-times'
import { getTrainers } from '@/lib/trainer'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/mails')({
  component: RouteComponent,
  loader: async() => {
    const [trainingTimes, trainers] = await Promise.all([
      getTrainingTimes(),
      getTrainers()
    ])
    return { trainingTimes, trainers }
  },
})

function RouteComponent() {
  const { trainingTimes, trainers } = Route.useLoaderData()

  return (
    <div className='w-64'>
      <TrainingCard content={trainingTimes} collapsed={true}/>
      <TrainerCard trainers={trainers} />
    </div>
  )
}
