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

const signedUrlLifetimeSeconds = 3600
const signedUrlCacheLifetimeMs = 55 * 60 * 1000
const signedUrlCacheLimit = 500
const profileUrlSessionKey = 'our-little-universe-profile-urls'

interface SignedUrlCacheEntry {
  url: string
  expiresAt: number
}

const signedUrlCache = new Map<string, SignedUrlCacheEntry>()
const sessionCachedPaths = new Set<string>()
let profileSessionCacheLoaded = false

function restoreProfileUrlSessionCache() {
  if (profileSessionCacheLoaded) return
  profileSessionCacheLoaded = true
  try {
    const value = window.sessionStorage.getItem(profileUrlSessionKey)
    if (!value) return
    const entries = JSON.parse(value) as Record<string, SignedUrlCacheEntry>
    const now = Date.now()
    for (const [path, entry] of Object.entries(entries)) {
      if (!entry.url || entry.expiresAt <= now) continue
      signedUrlCache.set(path, entry)
      sessionCachedPaths.add(path)
    }
  } catch {
    // Ignore malformed or unavailable session storage.
  }
}

function persistProfileUrlSessionCache() {
  try {
    const entries: Record<string, SignedUrlCacheEntry> = {}
    for (const path of sessionCachedPaths) {
      const entry = signedUrlCache.get(path)
      if (entry) entries[path] = entry
    }
    window.sessionStorage.setItem(profileUrlSessionKey, JSON.stringify(entries))
  } catch {
    // Session storage can be unavailable in restricted browsing modes.
  }
}

function trimSignedUrlCache() {
  while (signedUrlCache.size > signedUrlCacheLimit) {
    const oldestPath = signedUrlCache.keys().next().value
    if (!oldestPath) return
    signedUrlCache.delete(oldestPath)
  }
}

export function clearSignedMediaUrlCache() {
  signedUrlCache.clear()
  sessionCachedPaths.clear()
  profileSessionCacheLoaded = false
  try {
    window.sessionStorage.removeItem(profileUrlSessionKey)
  } catch {
    // Nothing to clear when browser storage is unavailable.
  }
}

export type UploadProgress = (progress: number) => void

export interface ValidatedMedia {
  mediaType: 'image' | 'video'
  mimeType: string
  size: number
  extension: string
}

async function optimizeProfileImage(file: File) {
  if (file.type === 'image/gif') return file

  const objectUrl = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.decoding = 'async'
    image.src = objectUrl
    await image.decode()

    const maxEdge = 720
    const scale = Math.min(1, maxEdge / Math.max(image.width, image.height))
    if (scale === 1 && file.size <= 600 * 1024) return file

    const width = Math.max(1, Math.round(image.width * scale))
    const height = Math.max(1, Math.round(image.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) return file
    context.drawImage(image, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/webp', 0.82)
    })
    if (!blob || blob.size >= file.size) return file

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'profile-photo'
    return new File([blob], `${baseName}.webp`, {
      type: 'image/webp',
      lastModified: Date.now(),
    })
  } catch {
    return file
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
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
  validateProfileFile(file)
  progress?.(5)
  const optimizedFile = await optimizeProfileImage(file)
  const metadata = validateProfileFile(optimizedFile)
  const path = `${coupleId}/profiles/${userId}/${crypto.randomUUID()}.${metadata.extension}`
  await uploadObject(path, optimizedFile, progress)
  return { path, ...metadata }
}

export async function removeMediaObjects(paths: string[]) {
  if (paths.length === 0) return
  const { error } = await supabase.storage.from(mediaBucket).remove(paths)
  if (error) throw new Error(error.message)
  for (const path of paths) {
    signedUrlCache.delete(path)
    sessionCachedPaths.delete(path)
  }
  persistProfileUrlSessionCache()
}

export async function createSignedMediaUrls(
  paths: string[],
  options: { cacheInSession?: boolean } = {},
) {
  if (options.cacheInSession) restoreProfileUrlSessionCache()
  const uniquePaths = [...new Set(paths.filter(Boolean))]
  const urls = new Map<string, string>()
  if (uniquePaths.length === 0) return urls

  const now = Date.now()
  const missingPaths: string[] = []
  for (const path of uniquePaths) {
    const cached = signedUrlCache.get(path)
    if (cached && cached.expiresAt > now) {
      urls.set(path, cached.url)
    } else {
      signedUrlCache.delete(path)
      missingPaths.push(path)
    }
  }

  if (missingPaths.length > 0) {
    const { data, error } = await supabase.storage
      .from(mediaBucket)
      .createSignedUrls(missingPaths, signedUrlLifetimeSeconds)
    if (error) throw new Error(error.message)

    const expiresAt = now + signedUrlCacheLifetimeMs
    for (const item of data ?? []) {
      if (!item.path || !item.signedUrl) continue
      signedUrlCache.set(item.path, { url: item.signedUrl, expiresAt })
      urls.set(item.path, item.signedUrl)
      if (options.cacheInSession) sessionCachedPaths.add(item.path)
    }
    trimSignedUrlCache()
    if (options.cacheInSession) persistProfileUrlSessionCache()
  }

  return urls
}
