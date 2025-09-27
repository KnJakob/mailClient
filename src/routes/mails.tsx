import { getTrainingTimes } from '@/lib/training-times'
import { getTrainers } from '@/lib/trainer'
import { createFileRoute } from '@tanstack/react-router'
import { getFreshmanText } from '@/lib/freshman'
import { MailSidebar } from '@/components/mail-sidebar'
import { MailTable } from '@/components/mail-table'
import { EmailData, fetchEmailsFromImap } from '@/lib/mail'
import { DataTable } from '@/components/ui/data-table'
import { columns } from '@/components/mail-table-columns'

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

// helper to format JS dates into dd.mm.yyyy
function formatDate(dateString) {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0") // months are 0-based
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

function RouteComponent() {
  const { trainingTimes, trainers, freshmanText, emails } = Route.useLoaderData()
  
  // transform emails before passing to DataTable
  const formattedEmails = emails.map(email => ({
    ...email,
    date: formatDate(email.date)
  }))

  return (
    <> 
      {/* <MailTable emails={emails}/> */}
      <DataTable columns={columns} data={formattedEmails} />
    <div>
      {/* <MailSidebar trainingTimes={trainingTimes} trainers={trainers} freshmanText={freshmanText} /> */}
    </div>
    </>
  )
}
