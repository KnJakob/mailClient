import { EmailData } from "@/lib/mail"

export function MailTable({emails}: {emails: EmailData[]}){
    return (
        <>
          {emails.map(email => (
            <div key={email.id}>{email.subject} – {email.from}</div>
          ))}

        </>
    )
}