import { createServerFn } from '@tanstack/react-start'
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'
import type { EmailMetaData } from '@/lib/mail'

const MAGIC_CATEGORIES = ['Probetraining', 'Meldebestätigung', 'Klärungsbedarf'] as const
const INBOX_MAILBOX = 'INBOX'
const MAGIC_TARGET_FOLDERS: Record<MagicCategory, string> = {
  Probetraining: 'Anfragen Neulinge',
  Meldebestätigung: 'Meldungsbestätigungen',
  Klärungsbedarf: 'Klärungsbedarf',
}

type MagicCategory = (typeof MAGIC_CATEGORIES)[number]

interface MagicInput {
  seq: number
}

interface MagicMail {
  uid: number
  subject: string
  from: string
  to: string
  body: string
}

interface MagicClassification {
  category: MagicCategory
  confidence: number
  reasoning: string
}

interface MagicResult {
  seq: number
  uid: number
  subject: string
  category: MagicCategory
  targetFolder: string
  strategy: string
  confidence: number
  reasoning: string
}

interface KeywordRule {
  term: string
  weight: number
}

const CATEGORY_RULES: Record<MagicCategory, KeywordRule[]> = {
  Meldebestätigung: [
    { term: 'meldebestaetigung', weight: 8 },
    { term: 'anmeldebestaetigung', weight: 7 },
    { term: 'tournamentsoftware', weight: 6 },
    { term: 'meldeportal', weight: 6 },
    { term: 'meldeportal badmintontraining', weight: 8 },
    { term: 'meldung eingegangen', weight: 4 },
    { term: 'anmeldung eingegangen', weight: 4 },
    { term: 'meldung bestaetigt', weight: 4 },
    { term: 'registrierung bestaetigt', weight: 4 },
  ],
  Probetraining: [
    { term: 'probetraining', weight: 8 },
    { term: 'probestunde', weight: 6 },
    { term: 'schnuppertraining', weight: 6 },
    { term: 'schnuppern', weight: 4 },
    { term: 'mittrainieren', weight: 6 },
    { term: 'badmintontraining', weight: 5 },
    { term: 'trainieren', weight: 3 },
    { term: 'training moeglich', weight: 4 },
    { term: 'training teilnehmen', weight: 4 },
  ],
  Klärungsbedarf: [
    { term: 'klaerungsbedarf', weight: 6 },
    { term: 'rueckfrage', weight: 5 },
    { term: 'unklar', weight: 4 },
    { term: 'bitte um hilfe', weight: 4 },
    { term: 'problem', weight: 3 },
    { term: 'frage', weight: 2 },
  ],
}

function createImapClient() {
  const username = process.env.GMX_USERNAME
  const password = process.env.GMX_PASSWORD

  if (!username || !password) {
    throw new Error('GMX_USERNAME und GMX_PASSWORD müssen gesetzt sein')
  }

  return new ImapFlow({
    host: 'imap.gmx.de',
    port: 993,
    secure: true,
    auth: { user: username, pass: password },
  })
}

function stripHtml(htmlValue: string) {
  return htmlValue
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeLowercaseForSearch(text: string) {
  return text
    .toLocaleLowerCase('de-DE')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function countPhraseMatches(haystack: string, phrase: string) {
  if (!haystack || !phrase) {
    return 0
  }

  const paddedHaystack = ` ${haystack} `
  const paddedPhrase = ` ${phrase} `
  let count = 0
  let searchStart = 0

  while (true) {
    const index = paddedHaystack.indexOf(paddedPhrase, searchStart)
    if (index === -1) {
      break
    }

    count += 1
    searchStart = index + paddedPhrase.length
  }

  return count
}

function scoreCategory(haystack: string, rules: KeywordRule[]) {
  let score = 0
  const matches: string[] = []

  for (const rule of rules) {
    const normalizedTerm = normalizeLowercaseForSearch(rule.term)
    const hits = countPhraseMatches(haystack, normalizedTerm)

    if (hits > 0) {
      score += hits * rule.weight
      matches.push(`${rule.term} x${hits}`)
    }
  }

  return { score, matches }
}

function classifyByKeywords(mail: MagicMail): MagicClassification {
  const normalizedMail = normalizeLowercaseForSearch([
    mail.subject,
    mail.from,
    mail.to,
    mail.body,
  ].join('\n'))

  const scored = {
    Meldebestätigung: scoreCategory(normalizedMail, CATEGORY_RULES.Meldebestätigung),
    Probetraining: scoreCategory(normalizedMail, CATEGORY_RULES.Probetraining),
    Klärungsbedarf: scoreCategory(normalizedMail, CATEGORY_RULES.Klärungsbedarf),
  }

  if (normalizedMail.includes('tournamentsoftware') && normalizedMail.includes('meldeportal')) {
    scored.Meldebestätigung.score += 5
    scored.Meldebestätigung.matches.push('kombi: tournamentsoftware + meldeportal')
  }

  if (normalizedMail.includes('badmintontraining') && normalizedMail.includes('trainieren')) {
    scored.Probetraining.score += 3
    scored.Probetraining.matches.push('kombi: badmintontraining + trainieren')
  }

  const ranking: Array<{ category: MagicCategory, score: number, matches: string[] }> = [
    { category: 'Meldebestätigung' as const, score: scored.Meldebestätigung.score, matches: scored.Meldebestätigung.matches },
    { category: 'Probetraining' as const, score: scored.Probetraining.score, matches: scored.Probetraining.matches },
    { category: 'Klärungsbedarf' as const, score: scored.Klärungsbedarf.score, matches: scored.Klärungsbedarf.matches },
  ].sort((left, right) => right.score - left.score)

  const winner = ranking[0]
  const runnerUp = ranking[1]

  if (winner.score === 0) {
    return {
      category: 'Klärungsbedarf',
      confidence: 0.35,
      reasoning: 'Keine relevanten Stichwoerter gefunden',
    }
  }

  const confidence = Math.max(0.4, Math.min(0.99, (winner.score - runnerUp.score + 1) / (winner.score + 1)))
  const reasoning = winner.matches.slice(0, 4).join(', ') || 'Score-basierte Einordnung'

  return {
    category: winner.category,
    confidence,
    reasoning,
  }
}

async function getMailForMagic(client: ImapFlow, seq: number): Promise<MagicMail> {
  const lock = await client.getMailboxLock(INBOX_MAILBOX)

  try {
    const fetchedMail = await client.fetchOne(seq.toString(), { source: true, envelope: true }, { uid: false })

    if (!fetchedMail) {
      throw new Error(`Mail mit Seq ${seq} nicht gefunden`)
    }

    if (!fetchedMail.source) {
      throw new Error(`Mail-Quelle für Seq ${seq} fehlt`)
    }

    const parsedMail = await simpleParser(fetchedMail.source)
    const subject = parsedMail.subject || fetchedMail.envelope?.subject || 'No Subject'
    const from = parsedMail.from?.text || fetchedMail.envelope?.from?.map(entry => entry.address).join(', ') || 'Unknown Sender'
    const to = parsedMail.to?.text || fetchedMail.envelope?.to?.map(entry => entry.address).join(', ') || 'Unknown Recipient'

    const textBody = parsedMail.text?.trim() || ''
    const htmlBodySource = typeof parsedMail.html === 'string'
      ? parsedMail.html
      : Buffer.isBuffer(parsedMail.html)
        ? parsedMail.html.toString('utf-8')
        : ''
    const htmlBody = htmlBodySource ? stripHtml(htmlBodySource) : ''
    const body = textBody || htmlBody || '[Kein extrahierbarer Textinhalt]'

    return {
      uid: fetchedMail.uid,
      subject,
      from,
      to,
      body,
    }
  } finally {
    lock.release()
  }
}

async function moveMailToFolder(client: ImapFlow, uid: number, targetFolder: string) {
  await client.mailboxCreate(targetFolder)

  const lock = await client.getMailboxLock(INBOX_MAILBOX)
  try {
    const moved = await client.messageMove(uid, targetFolder, { uid: true })

    if (moved === false) {
      throw new Error(`Mail mit UID ${uid} konnte nicht verschoben werden`)
    }
  } finally {
    lock.release()
  }
}

export const runMagic = createServerFn({ method: 'POST' })
  .validator((data: MagicInput) => {
    if (typeof data?.seq !== 'number' || Number.isNaN(data.seq) || data.seq < 1) {
      throw new Error('Magic benötigt eine gültige Seq Nummer')
    }

    return data
  })
  .handler(async ({ data }): Promise<MagicResult> => {
    const client = createImapClient()

    try {
      await client.connect()

      const mail = await getMailForMagic(client, data.seq)
      const classification = classifyByKeywords(mail)
      const targetFolder = MAGIC_TARGET_FOLDERS[classification.category]

      await moveMailToFolder(client, mail.uid, targetFolder)

      return {
        seq: data.seq,
        uid: mail.uid,
        subject: mail.subject,
        category: classification.category,
        targetFolder,
        strategy: 'keyword-lowercase-v1',
        confidence: classification.confidence,
        reasoning: classification.reasoning,
      }
    } catch (error) {
      console.error('Magic Verarbeitung fehlgeschlagen:', error)
      throw new Error(`Magic fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`)
    } finally {
      await client.logout().catch(() => undefined)
    }
  })

export async function triggerMagic(email: EmailMetaData) {
  const result = await runMagic({ data: { seq: email.id } })

  console.log(`Magic: Seq ${result.seq} als ${result.category} in ${result.targetFolder} verschoben`, {
    uid: result.uid,
    subject: result.subject,
    strategy: result.strategy,
    confidence: result.confidence,
    reasoning: result.reasoning,
  })

  return result
}
