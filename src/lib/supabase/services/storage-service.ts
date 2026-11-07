import { supabase } from '@/lib/supabase/client'

export const mediaBucket = 'couple-media'
export const memoryFileLimit = 25 * 1024 * 1024
export const profileFileLimit = 8 * 1024 * 1024

const imageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])
const videoTypes = new Set(['video/mp4', 'video/webm'])
const extensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
}

export type UploadProgress = (progress: number) => void

export interface ValidatedMedia {
  mediaType: 'image' | 'video'
  mimeType: string
  size: number
  extension: string
}

export function validateMemoryFile(file: File): ValidatedMedia {
  const mediaType = imageTypes.has(file.type)
    ? 'image'
    : videoTypes.has(file.type)
      ? 'video'
      : null
  if (!mediaType) {
    throw new Error('Choose a JPEG, PNG, WebP, GIF, MP4, or WebM file.')
  }
  if (file.size <= 0 || file.size > memoryFileLimit) {
    throw new Error('Memory media must be smaller than 25 MB.')
  }
  return {
    mediaType,
    mimeType: file.type,
    size: file.size,
    extension: extensions[file.type],
  }
}

export function validateProfileFile(file: File): ValidatedMedia {
  if (!imageTypes.has(file.type)) {
    throw new Error('Choose a JPEG, PNG, WebP, or GIF profile picture.')
  }
  if (file.size <= 0 || file.size > profileFileLimit) {
    throw new Error('Profile pictures must be smaller than 8 MB.')
  }
  return {
    mediaType: 'image',
    mimeType: file.type,
    size: file.size,
    extension: extensions[file.type],
  }
}

async function uploadObject(
  path: string,
  file: File,
  progress?: UploadProgress,
) {
  progress?.(15)
  const { error } = await supabase.storage
    .from(mediaBucket)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    })
  if (error) throw new Error(error.message)
  progress?.(75)
}

export async function uploadMemoryObject(
  coupleId: string,
  memoryId: string,
  file: File,
  progress?: UploadProgress,
) {
  const metadata = validateMemoryFile(file)
  const path = `${coupleId}/memories/${memoryId}/${crypto.randomUUID()}.${metadata.extension}`
  await uploadObject(path, file, progress)
  return { path, ...metadata }
}

export async function uploadProfileObject(
  coupleId: string,
  userId: string,
  file: File,
  progress?: UploadProgress,
) {
  const metadata = validateProfileFile(file)
  const path = `${coupleId}/profiles/${userId}/${crypto.randomUUID()}.${metadata.extension}`
  await uploadObject(path, file, progress)
  return { path, ...metadata }
}

export async function removeMediaObjects(paths: string[]) {
  if (paths.length === 0) return
  const { error } = await supabase.storage.from(mediaBucket).remove(paths)
  if (error) throw new Error(error.message)
}

export async function createSignedMediaUrls(paths: string[]) {
  if (paths.length === 0) return new Map<string, string>()
  const { data, error } = await supabase.storage
    .from(mediaBucket)
    .createSignedUrls(paths, 3600)
  if (error) throw new Error(error.message)
  const urls = new Map<string, string>()
  for (const item of data ?? []) {
    if (item.path && item.signedUrl) urls.set(item.path, item.signedUrl)
  }
  return urls
}
