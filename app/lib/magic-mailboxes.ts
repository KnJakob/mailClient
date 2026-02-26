export interface MagicMailboxDefinition {
  slug: string
  title: string
  mailbox: string
}

export const MAGIC_MAILBOXES: MagicMailboxDefinition[] = [
  {
    slug: 'anfragen',
    title: 'Anfragen Neulinge',
    mailbox: 'Anfragen Neulinge',
  },
  {
    slug: 'meldebestaetigung',
    title: 'Meldungsbestätigungen',
    mailbox: 'Meldungsbestätigungen',
  },
  {
    slug: 'klaerungsbedarf',
    title: 'Klärungsbedarf',
    mailbox: 'Klärungsbedarf',
  },
]

export function getMagicMailboxBySlug(slug: string) {
  return MAGIC_MAILBOXES.find((mailbox) => mailbox.slug === slug)
}
