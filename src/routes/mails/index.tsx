import { getTrainingTimes } from '@/lib/training-times'
import { getTrainers } from '@/lib/trainer'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getFreshmanText } from '@/lib/freshman'
import { fetchEmailsFromImap } from '@/lib/mail'
import { MailTable } from '@/components/mail-table'
import { triggerMagic } from '@/lib/magic'

const SUBJECT_PREVIEW_LENGTH = 80

export const Route = createFileRoute('/mails/')({
	component: RouteComponent,
	loader: async () => {
		const [trainingTimes, trainers, freshmanText, emails] = await Promise.all([
			getTrainingTimes(),
			getTrainers(),
			getFreshmanText(),
			fetchEmailsFromImap({ data: { beginFetch: 1, endFetch: 50 } }),
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

function formatFrom(fromString) {
	// Prüfen, ob ein Name-Teil mit <...> vorhanden ist
	const match = fromString.match(/^(.*?)\s*<(.+?)>$/)

	if (match) {
		// match[1] = Name-Teil, match[2] = Mailadresse
		let name = match[1].trim().replace(/^"|"$/g, "") // Anführungszeichen entfernen
		return name
	}

	// Kein Name, nur die Mailadresse -> direkt zurückgeben
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
  const router = useRouter()
  const { trainingTimes, trainers, freshmanText, emails } = Route.useLoaderData()

	// transform emails before passing to DataTable
  const formattedEmails = emails.map(email => ({
    ...email,
    date: formatDate(email.date),
    from: formatFrom(email.from),
    subject: truncateSubject(email.subject),
  }))

  const handleMagicClick = async(email) => {
    await triggerMagic(email)
    await router.invalidate()
  }

	return (
		<>
			<div className='flex'>
      <div className="flex-1">
        <MailTable data={formattedEmails} sent={false} onMagicClick={handleMagicClick} />
      </div>
    </div>
		</>
	)
}
