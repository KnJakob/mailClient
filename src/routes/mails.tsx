import { getTrainingTimes } from '@/lib/training-times'
import { getTrainers } from '@/lib/trainer'
import { createFileRoute } from '@tanstack/react-router'
import { getFreshmanText } from '@/lib/freshman'
import { MailSidebar } from '@/components/mail-sidebar'
import { MailTable } from '@/components/mail-table'
import { fetchEmailsFromImap } from '@/lib/mail'

export const Route = createFileRoute('/mails')({
  component: RouteComponent,
  loader: async() => {
    const [trainingTimes, trainers, freshmanText, emails] = await Promise.all([
      getTrainingTimes(),
      getTrainers(),
      getFreshmanText(),
      fetchEmailsFromImap(),
    ])
    return { trainingTimes, trainers, freshmanText, emails }
  },
})

function RouteComponent() {
  const { trainingTimes, trainers, freshmanText, emails } = Route.useLoaderData()

  return (
    <> 
      <MailTable emails={emails}/>
    <div>
      <MailSidebar trainingTimes={trainingTimes} trainers={trainers} freshmanText={freshmanText} />
    </div>
    </>
  )
}
