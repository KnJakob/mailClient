import { MailTable } from '@/components/mail-table'
import { getMagicMailboxBySlug } from '@/lib/magic-mailboxes'
import { fetchEmailsByMailbox } from '@/lib/mail'
import { createFileRoute } from '@tanstack/react-router'

const SUBJECT_PREVIEW_LENGTH = 80

export const Route = createFileRoute('/mails/magic/$mailbox')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const mailboxDefinition = getMagicMailboxBySlug(params.mailbox)

    if (!mailboxDefinition) {
      throw new Error(`Unbekannter Magic-Ordner: ${params.mailbox}`)
    }

    const emails = await fetchEmailsByMailbox({
      data: {
        mailbox: mailboxDefinition.mailbox,
        beginFetch: 1,
        endFetch: 50,
      },
    })

    return { mailboxDefinition, emails }
  },
})

function formatDate(dateString) {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

function formatFrom(fromString) {
  const match = fromString.match(/^(.*?)\s*<(.+?)>$/)

  if (match) {
    const name = match[1].trim().replace(/^"|"$/g, '')
    return name
  }

  return fromString.trim()
}

function truncateSubject(subject, maxLength = SUBJECT_PREVIEW_LENGTH) {
  const trimmedSubject = subject.trim()

  if (trimmedSubject.length <= maxLength) {
    return trimmedSubject
  }

  return `${trimmedSubject.slice(0, maxLength - 3)}...`
}

function RouteComponent() {
  const { mailboxDefinition, emails } = Route.useLoaderData()

  const formattedEmails = emails.map((email) => ({
    ...email,
    date: formatDate(email.date),
    from: formatFrom(email.from),
    subject: truncateSubject(email.subject),
  }))

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">{mailboxDefinition.title}</h2>
      <MailTable data={formattedEmails} sent={false} detailMailbox={mailboxDefinition.mailbox} />
    </div>
  )
}
