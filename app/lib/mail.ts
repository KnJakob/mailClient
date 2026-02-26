import { createServerFn } from '@tanstack/react-start'
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'
import { createServer } from 'node:http'

// Types
export interface EmailData {
  id: number 
  subject: string
  from: string[]
  to: string[]
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

interface FetchEmailsByMailboxParams extends FetchEmailsParams {
  mailbox: string
}

interface GetMailBySeqParams {
  seq: number
  mailbox?: string
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

async function mailboxExists(client: ImapFlow, mailboxName: string) {
  const mailboxes = await client.list()

  for (const mailbox of mailboxes) {
    if (mailbox.path === mailboxName) {
      return true
    }
  }

  return false
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

export const fetchEmailsByMailbox = createServerFn({ method: 'POST' })
  .validator((data: FetchEmailsByMailboxParams) => {
    if (typeof data.mailbox !== 'string' || data.mailbox.trim().length === 0) {
      throw new Error('mailbox muss ein nicht-leerer String sein')
    }

    if (typeof data.beginFetch !== 'number' || typeof data.endFetch !== 'number') {
      throw new Error('beginFetch und endFetch müssen Zahlen sein')
    }

    if (data.beginFetch < 1 || data.endFetch < data.beginFetch) {
      throw new Error('Ungültiger Bereich für Email-Abruf')
    }

    return {
      mailbox: data.mailbox.trim(),
      beginFetch: data.beginFetch,
      endFetch: data.endFetch,
    }
  })
  .handler(async ({ data }): Promise<EmailMetaData[]> => {
    const { mailbox, beginFetch = 1, endFetch = 50 } = data
    const client = createImapClient()
    const emails: EmailMetaData[] = []

    try {
      await client.connect()

      const exists = await mailboxExists(client, mailbox)
      if (!exists) {
        return []
      }

      const lock = await client.getMailboxLock(mailbox)
      if (!client.mailbox) throw new Error('Mailbox not available')

      try {
        const total = client.mailbox.exists
        if (total === 0) return []

        const pageSize = endFetch - beginFetch + 1
        const offset = beginFetch - 1
        const safeEnd = total - offset
        const safeBegin = Math.max(1, safeEnd - pageSize + 1)

        for await (const msg of client.fetch(
          { seq: `${safeBegin}:${safeEnd}` },
          { envelope: true }
        )) {
          emails.push({
            id: msg.seq,
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
      console.error(`Fehler beim Abrufen der E-Mails aus Mailbox ${mailbox}:`, error)
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

export function addressesOnly(field) {
  return field?.value?.map(addr => addr.address) || [];
}

function normalizeHtmlContent(htmlValue: unknown) {
  if (typeof htmlValue === 'string') {
    return htmlValue
  }

  if (Buffer.isBuffer(htmlValue)) {
    return htmlValue.toString('utf-8')
  }

  return undefined
}

function stripHtml(htmlValue: string) {
  return htmlValue
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}


export const getMailBySeq = createServerFn({method: 'POST'})
  .validator((data: GetMailBySeqParams) => {
    if (typeof data?.seq !== 'number') {
      throw new Error('Es muss nach Seq Nummer gefetcht werden')
    }

    if (typeof data.mailbox !== 'undefined' && (typeof data.mailbox !== 'string' || data.mailbox.trim().length === 0)) {
      throw new Error('Mailbox muss ein nicht-leerer String sein')
    }

    return {
      seq: data.seq,
      mailbox: data.mailbox?.trim(),
    }
  })
  .handler(async ({ data }): Promise<EmailData> => {
  const client = createImapClient()
  let email: EmailData | undefined
  const mailbox = data.mailbox || 'INBOX'

  try {
    await client.connect()

    const exists = await mailboxExists(client, mailbox)
    if (!exists) {
      throw new Error(`Mailbox ${mailbox} existiert nicht`)
    }

    // Posteingang öffnen
    const lock = await client.getMailboxLock(mailbox)
    if (!client.mailbox) throw new Error("Mailbox not available")

    try {

      // Nachrichten abrufen
      const fetched = await client.fetchOne(data.seq, { source: true });
      
      if (!fetched) {
        throw new Error(`Mail mit Seq Nummer ${data.seq} nicht gefunden.`);
      }

      const parsed = await simpleParser(fetched.source)

      const fromAddresses = addressesOnly(parsed.from)
      const toAddresses = addressesOnly(parsed.to)
      const htmlBody = normalizeHtmlContent(parsed.html)
      const textBody = typeof parsed.text === 'string' ? parsed.text.trim() : ''
      const bodyFromHtml = htmlBody ? stripHtml(htmlBody) : ''

      email = {
        id: fetched.uid,
        subject: parsed.subject || 'No Subject',
        from: fromAddresses.length > 0 ? fromAddresses : ['Unknown Sender'],
        to: toAddresses.length > 0 ? toAddresses : ['Unknown Recipient'],
        date: parsed.date?.toString() || new Date().toString(),
        body: textBody || bodyFromHtml,
        html: htmlBody,
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
