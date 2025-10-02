import { createServerFn } from '@tanstack/react-start'
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'
import { createServer } from 'node:http'

// Types
export interface EmailData {
  id: number 
  subject: string
  from: string
  to: string
  date: string
  body: string
  html?: string
  attachments: Array<{
    filename: string
    contentType: string
    size: number
  }>
}

export interface EmailMetaData {
  id: number
  subject: string
  from: string
  to: string
  date: string
}

interface FetchEmailsParams {
  beginFetch: number
  endFetch: number
}

// Verbindung zu GMX
const createImapClient = () => {
  const username = process.env.GMX_USERNAME
  const password = process.env.GMX_PASSWORD

  if (!username || !password) {
    throw new Error('GMX_USERNAME und GMX_PASSWORD müssen gesetzt sein')
  }

  return new ImapFlow({
    host: 'imap.gmx.de',
    port: 993,
    secure: true,
    auth: { user: username, pass: password }
  })
}

// Mails abrufen mit imapflow
export const fetchEmailsFromImap = createServerFn({method: 'POST'})
  .validator((data: FetchEmailsParams) => {
    if (typeof data.beginFetch !== 'number' || typeof data.endFetch !== 'number') {
      throw new Error('beginFetch und endFetch müssen Zahlen sein')
    }
    if (data.beginFetch < 1 || data.endFetch < data.beginFetch) {
      throw new Error('Ungültiger Bereich für Email-Abruf')
    }
    return data
  })
  .handler(async ({ data }): Promise<EmailMetaData[]> => {
  const { beginFetch = 1, endFetch = 50 } = data
  const client = createImapClient()
  const emails: EmailMetaData[] = []

  try {
    await client.connect()

    // Posteingang öffnen
    const lock = await client.getMailboxLock('INBOX')
    if (!client.mailbox) throw new Error("Mailbox not available")

    try {
      const total = client.mailbox.exists
      if (total === 0) return []

      const pageSize = endFetch - beginFetch + 1
      const offset = beginFetch - 1 // 0-basiert

      // Bereich validieren und anpassen
      const safeEnd = total - offset
      const safeBegin = Math.max(1, safeEnd - pageSize + 1)


      // Nachrichten abrufen
      for await (const msg of client.fetch(
        { seq: `${safeBegin}:${safeEnd}` },
        { envelope: true } // nur Envelope
      )) {
        emails.push({
          id: msg.seq, // stabile ID
          subject: msg.envelope?.subject || 'No Subject',
          from: msg.envelope?.from?.map(f => f.address).join(', ') || 'Unknown Sender',
          to: msg.envelope?.to?.map(t => t.address).join(', ') || 'Unknown Recipient',
          date: msg.envelope?.date?.toString() || new Date().toString(),
        });
      }
    } finally {
      lock.release()
    }
  } catch (error) {
      console.error('Fehler beim Abrufen der E-Mails:', error)
      throw new Error(`E-Mail-Abruf fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`)
  } finally {
    await client.logout()
  }

  return emails.sort((a, b) => b.id - a.id)
})

export const getFlaggedMails = createServerFn({method: 'GET'})
  .handler(async ({ data }): Promise<EmailMetaData[]> => {
  const client = createImapClient()
  const emails: EmailMetaData[] = []

  try {
    await client.connect()

    // Posteingang öffnen
    const lock = await client.getMailboxLock('INBOX')
    if (!client.mailbox) throw new Error("Mailbox not available")
    
    // Suche nach allen Nachrichten mit dem Flag "Flagged"
    const uids = await client.search({ flagged: true });
    console.log("\n\n\n" + uids + "\n\n\n")
    if(!uids || uids.length === 0) return []

    try {

      // Nachrichten abrufen
      for await (const msg of client.fetch(
        uids,
        { uid: true, envelope: true } // nur Envelope
      )) {
        emails.push({
          id: msg.seq, // stabile ID
          subject: msg.envelope?.subject || 'No Subject',
          from: msg.envelope?.from?.map(f => f.address).join(', ') || 'Unknown Sender',
          to: msg.envelope?.to?.map(t => t.address).join(', ') || 'Unknown Recipient',
          date: msg.envelope?.date?.toString() || new Date().toString(),
        });
      }
    } finally {
      lock.release()
    }
  } catch (error) {
      console.error('Fehler beim Abrufen der E-Mails Favoriten:', error)
      throw new Error(`E-Mail-Abruf fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`)
  } finally {
    await client.logout()
  }

  return emails.sort((a, b) => b.id - a.id)
})

export const getMailBySeq = createServerFn({method: 'POST'})
  .validator((data: number) => {
    if (typeof data !== 'number') {
      throw new Error('Es muss nach Seq Nummer gefetcht werden')
    }
    return data
  })
  .handler(async ({ data }): Promise<EmailData> => {
  const client = createImapClient()
  let email: EmailData | undefined

  try {
    await client.connect()

    // Posteingang öffnen
    const lock = await client.getMailboxLock('INBOX')
    if (!client.mailbox) throw new Error("Mailbox not available")

    try {

      // Nachrichten abrufen
      const fetched = await client.fetchOne(data, { source: true });
      
      if (!fetched) {
        throw new Error(`Mail mit Seq Nummer ${data} nicht gefunden.`);
      }

      const parsed = await simpleParser(fetched.source)

      email = {
        id: fetched.uid,
        subject: parsed.subject || 'No Subject',
        from: parsed.from?.text || 'Unknown Sender',
        to: parsed.to?.text || 'Unknown Recipient',
        date: parsed.date || new Date(),
        body: parsed.text || '',
        html: parsed.html || undefined,
        attachments:
          parsed.attachments?.map(att => ({
            filename: att.filename || 'unnamed',
            contentType: att.contentType || 'application/octet-stream',
            size: att.size || 0
          })) || []
      }

    } finally {
      lock.release()
    }
  } catch (error) {
      console.error('Fehler beim Abrufen der E-Mails Favoriten:', error)
      throw new Error(`E-Mail-Abruf fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`)
  } finally {
    await client.logout()
  }

  return email
})

export const fetchEmailsSent = createServerFn({method: 'POST'})
  .validator((data: FetchEmailsParams) => {
    if (typeof data.beginFetch !== 'number' || typeof data.endFetch !== 'number') {
      throw new Error('beginFetch und endFetch müssen Zahlen sein')
    }
    if (data.beginFetch < 1 || data.endFetch < data.beginFetch) {
      throw new Error('Ungültiger Bereich für Email-Abruf')
    }
    return data
  })
  .handler(async ({ data }): Promise<EmailMetaData[]> => {
  const { beginFetch = 1, endFetch = 50 } = data
  const client = createImapClient()
  const emails: EmailMetaData[] = []

  try {
    await client.connect()

    // Posteingang öffnen
    const lock = await client.getMailboxLock('Gesendet')
    if (!client.mailbox) throw new Error("Mailbox not available")

    try {
      const total = client.mailbox.exists
      if (total === 0) return []

      const pageSize = endFetch - beginFetch + 1
      const offset = beginFetch - 1 // 0-basiert

      // Bereich validieren und anpassen
      const safeEnd = total - offset
      const safeBegin = Math.max(1, safeEnd - pageSize + 1)


      // Nachrichten abrufen
      for await (const msg of client.fetch(
        { seq: `${safeBegin}:${safeEnd}` },
        { envelope: true } // komplette Nachricht als Stream
      )) {
        emails.push({
          id: msg.seq, // stabile ID
          subject: msg.envelope?.subject || 'No Subject',
          from: msg.envelope?.from?.map(f => f.address).join(', ') || 'Unknown Sender',
          to: msg.envelope?.to?.map(t => t.address).join(', ') || 'Unknown Recipient',
          date: msg.envelope?.date?.toString() || new Date().toString(),
        })
      }
    } finally {
      lock.release()
    }
  } catch (error) {
      console.error('Fehler beim Abrufen der E-Mails:', error)
      throw new Error(`E-Mail-Abruf fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`)
  } finally {
    await client.logout()
  }

  return emails.sort((a, b) => b.id - a.id)
})
