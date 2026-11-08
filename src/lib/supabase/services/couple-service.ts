import type {
  BackgroundPreference,
  ConnectionSettingsDraft,
  CoupleProfile,
  Dream,
  DreamDraft,
  ImportantDate,
  SpecialDateDraft,
  ThinkingOfYou,
} from '@/features/couple/types'
import { supabase } from '@/lib/supabase/client'
import {
  createSignedMediaUrls,
  removeMediaObjects,
  type UploadProgress,
  uploadProfileObject,
} from '@/lib/supabase/services/storage-service'
import {
  asServiceResult,
  type CoupleRow,
  type DreamRow,
  type ImportantDateRow,
  type ProfileRow,
  type ThinkingOfYouRow,
} from '@/lib/supabase/services/types'

export interface CoupleData {
  profile: CoupleProfile
  dreams: Dream[]
  importantDates: ImportantDate[]
  latestThinkingOfYou: ThinkingOfYou | null
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

function mapDream(row: DreamRow): Dream {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    targetDate: row.target_date ?? undefined,
    completed: row.is_completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapDate(row: ImportantDateRow): ImportantDate {
  return {
    id: row.id,
    title: row.title,
    date: row.event_date,
    type: row.event_type,
    recurringAnnually: row.recurs_annually,
    isCustom: row.event_type === 'custom',
  }
}

export async function loadCoupleData(
  coupleId: string,
  memberIds: string[],
): Promise<CoupleData> {
  const coupleRequest = Promise.resolve(
    supabase.from('couples').select('*').eq('id', coupleId).single(),
  )
  const profilesRequest = Promise.resolve(
    supabase.from('profiles').select('*').in('id', memberIds),
  )
  const dreamsRequest = Promise.resolve(
    supabase.from('dreams').select('*').eq('couple_id', coupleId),
  )
  const datesRequest = Promise.resolve(
    supabase.from('important_dates').select('*').eq('couple_id', coupleId),
  )
  const thinkingRequest = Promise.resolve(
    supabase
      .from('thinking_of_you')
      .select('*')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false })
      .limit(1),
  )

  const [coupleValue, profilesValue] = await Promise.all([
    coupleRequest,
    profilesRequest,
  ])
  const coupleResult = asServiceResult<CoupleRow>(coupleValue)
  const profilesResult = asServiceResult<ProfileRow[]>(profilesValue)
  throwIfError(coupleResult.error)
  throwIfError(profilesResult.error)
  if (!coupleResult.data) throw new Error('Shared space was not found.')

  const avatarUrlsRequest = createSignedMediaUrls(
    (profilesResult.data ?? [])
      .map((profile) => profile.avatar_path)
      .filter((path): path is string => Boolean(path)),
    { cacheInSession: true },
  )
  const [dreamsValue, datesValue, thinkingValue, avatarUrls] =
    await Promise.all([
      dreamsRequest,
      datesRequest,
      thinkingRequest,
      avatarUrlsRequest,
    ])
  const dreamsResult = asServiceResult<DreamRow[]>(dreamsValue)
  const datesResult = asServiceResult<ImportantDateRow[]>(datesValue)
  const thinkingResult = asServiceResult<ThinkingOfYouRow[]>(thinkingValue)
  throwIfError(dreamsResult.error)
  throwIfError(datesResult.error)
  throwIfError(thinkingResult.error)
  const profiles = new Map(
    (profilesResult.data ?? []).map((profile) => [profile.id, profile]),
  )
  const partners = memberIds.slice(0, 2).map((id) => {
    const profile = profiles.get(id)
    const name = profile?.display_name ?? 'Partner'
    return {
      id,
      name,
      initial: name.charAt(0).toUpperCase() || '?',
      photo: profile?.avatar_path
        ? avatarUrls.get(profile.avatar_path)
        : undefined,
      photoPath: profile?.avatar_path ?? undefined,
      city: profile?.city ?? undefined,
      country: profile?.country ?? undefined,
      timezone: profile?.timezone ?? undefined,
    }
  })
  while (partners.length < 2) {
    partners.push({
      id: '',
      name: 'Waiting for partner',
      initial: '?',
      photo: undefined,
      photoPath: undefined,
      city: undefined,
      country: undefined,
      timezone: undefined,
    })
  }

  return {
    profile: {
      partners: [partners[0], partners[1]],
      relationshipStartDate: coupleResult.data.relationship_start_date ?? '',
      description: coupleResult.data.description,
      nextTimeTogether: coupleResult.data.next_time_together ?? '',
      background: {
        preset: coupleResult.data.background_preset ?? 'default',
        customColor: coupleResult.data.background_custom_color ?? undefined,
      },
    },
    dreams: (dreamsResult.data ?? []).map(mapDream),
    importantDates: (datesResult.data ?? []).map(mapDate),
    latestThinkingOfYou: thinkingResult.data?.[0]
      ? {
          id: thinkingResult.data[0].id,
          senderId: thinkingResult.data[0].sender_id,
          senderName:
            profiles.get(thinkingResult.data[0].sender_id)?.display_name ??
            'Partner',
          createdAt: thinkingResult.data[0].created_at,
        }
      : null,
  }
}

export async function replaceProfilePhoto(input: {
  coupleId: string
  userId: string
  oldPath?: string
  file: File
  progress?: UploadProgress
}) {
  const uploaded = await uploadProfileObject(
    input.coupleId,
    input.userId,
    input.file,
    input.progress,
  )
  const result = asServiceResult<null>(
    await supabase
      .from('profiles')
      .update({
        avatar_path: uploaded.path,
        avatar_mime_type: uploaded.mimeType,
        avatar_size_bytes: uploaded.size,
      })
      .eq('id', input.userId),
  )
  if (result.error) {
    await removeMediaObjects([uploaded.path]).catch(() => undefined)
    throw new Error(result.error.message)
  }
  input.progress?.(100)
  if (input.oldPath) await removeMediaObjects([input.oldPath])
}

export async function removeProfilePhotoRecord(input: {
  userId: string
  oldPath?: string
}) {
  if (!input.oldPath) return
  const result = asServiceResult<null>(
    await supabase
      .from('profiles')
      .update({
        avatar_path: null,
        avatar_mime_type: null,
        avatar_size_bytes: null,
      })
      .eq('id', input.userId),
  )
  throwIfError(result.error)
  await removeMediaObjects([input.oldPath])
}

export async function updateCoupleProfile(input: {
  coupleId: string
  userId: string
  profile: CoupleProfile
}) {
  const currentPartner = input.profile.partners.find(
    (partner) => partner.id === input.userId,
  )
  if (!currentPartner) throw new Error('Your partner profile was not found.')
  const [coupleValue, profileValue] = await Promise.all([
    supabase
      .from('couples')
      .update({
        relationship_start_date: input.profile.relationshipStartDate || null,
        description: input.profile.description.trim(),
        next_time_together: input.profile.nextTimeTogether || null,
      })
      .eq('id', input.coupleId),
    supabase
      .from('profiles')
      .update({
        display_name: currentPartner.name.trim(),
        city: currentPartner.city?.trim() || null,
        country: currentPartner.country?.trim() || null,
        timezone: currentPartner.timezone?.trim() || null,
      })
      .eq('id', input.userId),
  ])
  throwIfError(asServiceResult<null>(coupleValue).error)
  throwIfError(asServiceResult<null>(profileValue).error)
}

export async function updateConnectionSettings(input: {
  coupleId: string
  userId: string
  settings: ConnectionSettingsDraft
}) {
  const [profileValue, coupleValue] = await Promise.all([
    supabase
      .from('profiles')
      .update({
        city: input.settings.city.trim() || null,
        country: input.settings.country.trim() || null,
        timezone: input.settings.timezone.trim() || null,
      })
      .eq('id', input.userId),
    supabase
      .from('couples')
      .update({
        next_time_together: input.settings.nextTimeTogether || null,
      })
      .eq('id', input.coupleId),
  ])
  throwIfError(asServiceResult<null>(profileValue).error)
  throwIfError(asServiceResult<null>(coupleValue).error)
}

export async function updateCoupleBackground(
  coupleId: string,
  preference: BackgroundPreference,
) {
  const result = asServiceResult<null>(
    await supabase
      .from('couples')
      .update({
        background_preset: preference.preset,
        background_custom_color:
          preference.preset === 'custom'
            ? preference.customColor?.toUpperCase()
            : null,
      })
      .eq('id', coupleId),
  )
  throwIfError(result.error)
}

export async function createThinkingOfYou(coupleId: string, userId: string) {
  const result = asServiceResult<ThinkingOfYouRow>(
    await supabase
      .from('thinking_of_you')
      .insert({ couple_id: coupleId, sender_id: userId })
      .select('*')
      .single(),
  )
  throwIfError(result.error)
  if (!result.data) throw new Error('Thinking of You was not sent.')
}

export async function createDreamRecord(
  coupleId: string,
  userId: string,
  draft: DreamDraft,
) {
  const result = asServiceResult<DreamRow>(
    await supabase
      .from('dreams')
      .insert({
        couple_id: coupleId,
        title: draft.title.trim(),
        description: draft.description.trim(),
        category: draft.category,
        target_date: draft.targetDate || null,
        created_by: userId,
        updated_by: userId,
      })
      .select('*')
      .single(),
  )
  throwIfError(result.error)
  if (!result.data) throw new Error('Dream was not created.')
  return mapDream(result.data)
}

export async function updateDreamRecord(
  id: string,
  userId: string,
  changes: Partial<DreamDraft> & { completed?: boolean },
) {
  const values: Record<string, unknown> = { updated_by: userId }
  if (changes.title !== undefined) values.title = changes.title.trim()
  if (changes.description !== undefined)
    values.description = changes.description.trim()
  if (changes.category !== undefined) values.category = changes.category
  if (changes.targetDate !== undefined)
    values.target_date = changes.targetDate || null
  if (changes.completed !== undefined) values.is_completed = changes.completed
  const result = asServiceResult<DreamRow>(
    await supabase
      .from('dreams')
      .update(values)
      .eq('id', id)
      .select('*')
      .single(),
  )
  throwIfError(result.error)
  if (!result.data) throw new Error('Dream was not updated.')
  return mapDream(result.data)
}

export async function deleteDreamRecord(id: string) {
  const result = asServiceResult<null>(
    await supabase.from('dreams').delete().eq('id', id),
  )
  throwIfError(result.error)
}

export async function createDateRecord(
  coupleId: string,
  userId: string,
  draft: SpecialDateDraft,
) {
  const result = asServiceResult<ImportantDateRow>(
    await supabase
      .from('important_dates')
      .insert({
        couple_id: coupleId,
        title: draft.title.trim(),
        event_type: 'custom',
        event_date: draft.date,
        recurs_annually: draft.recurringAnnually,
        created_by: userId,
        updated_by: userId,
      })
      .select('*')
      .single(),
  )
  throwIfError(result.error)
  if (!result.data) throw new Error('Important date was not created.')
  return mapDate(result.data)
}

export async function updateDateRecord(
  id: string,
  userId: string,
  draft: SpecialDateDraft,
) {
  const result = asServiceResult<ImportantDateRow>(
    await supabase
      .from('important_dates')
      .update({
        title: draft.title.trim(),
        event_date: draft.date,
        recurs_annually: draft.recurringAnnually,
        updated_by: userId,
      })
      .eq('id', id)
      .eq('event_type', 'custom')
      .select('*')
      .single(),
  )
  throwIfError(result.error)
  if (!result.data) throw new Error('Important date was not updated.')
  return mapDate(result.data)
}

export async function deleteDateRecord(id: string) {
  const result = asServiceResult<null>(
    await supabase
      .from('important_dates')
      .delete()
      .eq('id', id)
      .eq('event_type', 'custom'),
  )
  throwIfError(result.error)
}
