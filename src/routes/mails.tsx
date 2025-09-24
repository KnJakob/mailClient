import { getTrainingTimes } from '@/lib/training-times'
import { getTrainers } from '@/lib/trainer'
import { createFileRoute } from '@tanstack/react-router'
import { getFreshmanText } from '@/lib/freshman'
import { MailSidebar } from '@/components/mail-sidebar'

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
      <MailSidebar trainingTimes={trainingTimes} trainers={trainers} freshmanText={freshmanText} />
    </div>
  )
}
