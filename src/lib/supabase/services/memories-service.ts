import type {
  MemoryDraft,
  MemoryMedia,
  TimelineMemory,
} from '@/features/timeline/types'
import { supabase } from '@/lib/supabase/client'
import {
  createSignedMediaUrls,
  removeMediaObjects,
  type UploadProgress,
  uploadMemoryObject,
} from '@/lib/supabase/services/storage-service'
import {
  asServiceResult,
  type MemoryMediaRow,
  type MemoryRow,
} from '@/lib/supabase/services/types'

function check(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

async function loadMedia(memoryIds: string[]) {
  const grouped = new Map<string, MemoryMedia[]>()
  if (!memoryIds.length) return grouped
  const result = asServiceResult<MemoryMediaRow[]>(
    await supabase.from('memory_media').select('*').in('memory_id', memoryIds),
  )
  check(result.error)
  const rows = result.data ?? []
  const urls = await createSignedMediaUrls(rows.map((row) => row.object_path))
  for (const row of rows) {
    const src = urls.get(row.object_path)
    if (!src) continue
    const item: MemoryMedia = {
      id: row.id,
      objectPath: row.object_path,
      mediaType: row.media_type,
      mimeType: row.mime_type,
      sizeBytes: row.file_size_bytes,
      src,
      alt: 'Shared memory media',
    }
    grouped.set(row.memory_id, [...(grouped.get(row.memory_id) ?? []), item])
  }
  return grouped
}

function mapMemory(
  row: MemoryRow,
  names: Map<string, string>,
  media: MemoryMedia[] = [],
): TimelineMemory {
  const image = media.find((item) => item.mediaType === 'image')
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.event_date,
    media,
    photo: image ? { src: image.src, alt: `${row.title} memory` } : undefined,
    milestoneType: row.milestone_type,
    createdBy: names.get(row.created_by) ?? 'Partner',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isFavorite: row.is_favorite,
    deletedAt: row.deleted_at ?? undefined,
    deletedBy: row.deleted_by
      ? (names.get(row.deleted_by) ?? 'Partner')
      : undefined,
  }
}

export async function loadMemories(
  coupleId: string,
  names: Map<string, string>,
) {
  const result = asServiceResult<MemoryRow[]>(
    await supabase
      .from('memories')
      .select('*')
      .eq('couple_id', coupleId)
      .order('event_date', { ascending: false }),
  )
  check(result.error)
  const rows = result.data ?? []
  const media = await loadMedia(rows.map((row) => row.id))
  return rows.map((row) => mapMemory(row, names, media.get(row.id)))
}

async function addMedia(
  coupleId: string,
  memoryId: string,
  userId: string,
  file: File,
  progress?: UploadProgress,
) {
  const uploaded = await uploadMemoryObject(coupleId, memoryId, file, progress)
  const result = asServiceResult<MemoryMediaRow>(
    await supabase
      .from('memory_media')
      .insert({
        couple_id: coupleId,
        memory_id: memoryId,
        object_path: uploaded.path,
        media_type: uploaded.mediaType,
        mime_type: uploaded.mimeType,
        file_size_bytes: uploaded.size,
        uploaded_by: userId,
      })
      .select('*')
      .single(),
  )
  if (result.error || !result.data) {
    await removeMediaObjects([uploaded.path]).catch(() => undefined)
    throw new Error(result.error?.message ?? 'Media metadata was not saved.')
  }
  progress?.(100)
  return result.data
}

export async function createMemoryRecord(
  coupleId: string,
  userId: string,
  draft: MemoryDraft,
  names: Map<string, string>,
  progress?: UploadProgress,
) {
  const result = asServiceResult<MemoryRow>(
    await supabase
      .from('memories')
      .insert({
        couple_id: coupleId,
        created_by: userId,
        updated_by: userId,
        title: draft.title.trim(),
        description: draft.description.trim(),
        event_date: draft.date,
        milestone_type: draft.milestoneType,
      })
      .select('*')
      .single(),
  )
  check(result.error)
  if (!result.data) throw new Error('Memory was not created.')
  try {
    if (draft.mediaFile)
      await addMedia(
        coupleId,
        result.data.id,
        userId,
        draft.mediaFile,
        progress,
      )
  } catch (error) {
    await supabase.from('memories').delete().eq('id', result.data.id)
    throw error
  }
  return mapMemory(result.data, names)
}

async function replaceMedia(
  coupleId: string,
  memoryId: string,
  userId: string,
  file?: File,
  remove?: boolean,
  progress?: UploadProgress,
) {
  if (!file && !remove) return
  const existing = asServiceResult<MemoryMediaRow[]>(
    await supabase.from('memory_media').select('*').eq('memory_id', memoryId),
  )
  check(existing.error)
  let inserted: MemoryMediaRow | undefined
  if (file)
    inserted = await addMedia(coupleId, memoryId, userId, file, progress)
  const old = (existing.data ?? []).filter((row) => row.id !== inserted?.id)
  try {
    await removeMediaObjects(old.map((row) => row.object_path))
    if (old.length)
      check(
        asServiceResult<null>(
          await supabase
            .from('memory_media')
            .delete()
            .in(
              'id',
              old.map((row) => row.id),
            ),
        ).error,
      )
  } catch (error) {
    if (inserted) {
      await supabase.from('memory_media').delete().eq('id', inserted.id)
      await removeMediaObjects([inserted.object_path]).catch(() => undefined)
    }
    throw error
  }
}

export async function updateMemoryRecord(
  coupleId: string,
  id: string,
  userId: string,
  draft: MemoryDraft,
  names: Map<string, string>,
  progress?: UploadProgress,
) {
  const result = asServiceResult<MemoryRow>(
    await supabase
      .from('memories')
      .update({
        updated_by: userId,
        title: draft.title.trim(),
        description: draft.description.trim(),
        event_date: draft.date,
        milestone_type: draft.milestoneType,
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select('*')
      .single(),
  )
  check(result.error)
  if (!result.data) throw new Error('Memory was not updated.')
  await replaceMedia(
    coupleId,
    id,
    userId,
    draft.mediaFile,
    draft.removeMedia,
    progress,
  )
  return mapMemory(result.data, names)
}

export async function softDeleteMemoryRecord(id: string, userId: string) {
  check(
    asServiceResult<null>(
      await supabase
        .from('memories')
        .update({
          updated_by: userId,
          deleted_at: new Date().toISOString(),
          deleted_by: userId,
        })
        .eq('id', id)
        .is('deleted_at', null),
    ).error,
  )
}
export async function restoreMemoryRecord(id: string, userId: string) {
  check(
    asServiceResult<null>(
      await supabase
        .from('memories')
        .update({ updated_by: userId, deleted_at: null, deleted_by: null })
        .eq('id', id)
        .not('deleted_at', 'is', null),
    ).error,
  )
}
export async function permanentlyDeleteMemoryRecord(id: string) {
  const media = asServiceResult<MemoryMediaRow[]>(
    await supabase.from('memory_media').select('*').eq('memory_id', id),
  )
  check(media.error)
  await removeMediaObjects((media.data ?? []).map((row) => row.object_path))
  check(
    asServiceResult<null>(await supabase.from('memories').delete().eq('id', id))
      .error,
  )
}
export async function setMemoryFavorite(
  id: string,
  userId: string,
  favorite: boolean,
) {
  check(
    asServiceResult<null>(
      await supabase
        .from('memories')
        .update({ updated_by: userId, is_favorite: favorite })
        .eq('id', id)
        .is('deleted_at', null),
    ).error,
  )
}
