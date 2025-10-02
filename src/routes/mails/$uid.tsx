import { getFreshmanText } from '@/lib/freshman'
import { getMailBySeq } from '@/lib/mail'
import { getTrainers } from '@/lib/trainer'
import { getTrainingTimes } from '@/lib/training-times'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/mails/$uid')({
  component: RouteComponent,
  loader: async({params}) => {
    const uid = parseInt(params.uid, 10)
    if (isNaN(uid)) {
      throw new Error('UID muss eine Zahl sein')
    }
    const [trainingTimes, trainers, freshmanText, email] = await Promise.all([
      getTrainingTimes(),
      getTrainers(),
      getFreshmanText(),
      getMailBySeq({data: uid})
    ])
    return { trainingTimes, trainers, freshmanText, email }
  },
})

function RouteComponent() {
  const { trainingTimes, trainers, freshmanText, email } = Route.useLoaderData()
  return (
    <>
    <div>Test for MailByUID</div>
    <p className='whitespace-pre'>From: {email.from}. </p>
    <p>Subject: {email.subject}.</p>
    <p className='whitespace-pre-line'> Body: {email.body}</p>
    </>
  )
}
