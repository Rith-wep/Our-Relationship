import type { LetterDraftInput, LoveLetter } from '@/features/letters/types'
import { supabase } from '@/lib/supabase/client'
import {
  asServiceResult,
  type LoveLetterRow,
  type MailboxRow,
} from '@/lib/supabase/services/types'

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

function mapLetter(
  row: LoveLetterRow,
  mailbox: MailboxRow,
  memberNames: Map<string, string>,
): LoveLetter {
  return {
    id: row.id,
    coupleId: row.couple_id,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    senderName: memberNames.get(row.sender_id) ?? 'Partner',
    recipientName: memberNames.get(row.recipient_id) ?? 'Partner',
    title: row.title,
    body: row.body,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sentAt: row.sent_at,
    readAt: row.read_at,
    favorite: mailbox.is_favorite,
    deletedAt: mailbox.deleted_at,
  }
}

export async function loadLetters(
  coupleId: string,
  userId: string,
  memberNames: Map<string, string>,
) {
  const mailboxResult = asServiceResult<MailboxRow[]>(
    await supabase
      .from('love_letter_mailboxes')
      .select('*')
      .eq('couple_id', coupleId)
      .eq('user_id', userId),
  )
  throwIfError(mailboxResult.error)
  const mailboxes = mailboxResult.data ?? []
  if (mailboxes.length === 0) return []
  const letterResult = asServiceResult<LoveLetterRow[]>(
    await supabase
      .from('love_letters')
      .select('*')
      .in(
        'id',
        mailboxes.map((mailbox) => mailbox.letter_id),
      ),
  )
  throwIfError(letterResult.error)
  const mailboxByLetter = new Map(
    mailboxes.map((mailbox) => [mailbox.letter_id, mailbox]),
  )
  return (letterResult.data ?? []).flatMap((letter) => {
    const mailbox = mailboxByLetter.get(letter.id)
    return mailbox ? [mapLetter(letter, mailbox, memberNames)] : []
  })
}

export async function createDraftRecord(
  coupleId: string,
  senderId: string,
  recipientId: string,
  input: LetterDraftInput,
) {
  const result = asServiceResult<LoveLetterRow>(
    await supabase
      .from('love_letters')
      .insert({
        couple_id: coupleId,
        sender_id: senderId,
        recipient_id: recipientId,
        title: input.title.trim(),
        body: input.body,
        status: 'draft',
      })
      .select('*')
      .single(),
  )
  throwIfError(result.error)
  if (!result.data) throw new Error('Draft was not created.')
  return result.data
}

export async function updateDraftRecord(id: string, input: LetterDraftInput) {
  const result = asServiceResult<null>(
    await supabase
      .from('love_letters')
      .update({ title: input.title.trim(), body: input.body })
      .eq('id', id)
      .eq('status', 'draft'),
  )
  throwIfError(result.error)
}

export async function sendLetterRecord(id: string) {
  const result = asServiceResult<null>(
    await supabase
      .from('love_letters')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'draft'),
  )
  throwIfError(result.error)
}

export async function deleteDraftRecord(id: string) {
  const result = asServiceResult<null>(
    await supabase
      .from('love_letters')
      .delete()
      .eq('id', id)
      .eq('status', 'draft'),
  )
  throwIfError(result.error)
}

export async function markLetterRead(id: string) {
  const result = asServiceResult<null>(
    await supabase
      .from('love_letters')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'sent'),
  )
  throwIfError(result.error)
}

async function updateMailbox(
  letterId: string,
  userId: string,
  values: { is_favorite?: boolean; deleted_at?: string | null },
) {
  const result = asServiceResult<null>(
    await supabase
      .from('love_letter_mailboxes')
      .update(values)
      .eq('letter_id', letterId)
      .eq('user_id', userId),
  )
  throwIfError(result.error)
}

export function setLetterFavorite(
  letterId: string,
  userId: string,
  favorite: boolean,
) {
  return updateMailbox(letterId, userId, { is_favorite: favorite })
}

export function setLetterDeleted(
  letterId: string,
  userId: string,
  deleted: boolean,
) {
  return updateMailbox(letterId, userId, {
    deleted_at: deleted ? new Date().toISOString() : null,
  })
}
