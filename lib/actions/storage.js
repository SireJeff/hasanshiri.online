'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(formData) {
  const supabase = await createClient()

  const file = formData.get('file')
  const bucket = formData.get('bucket') || 'articles'
  const folder = formData.get('folder') || ''

  if (!file) {
    return { error: 'No file provided' }
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = folder ? `${folder}/${fileName}` : fileName

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Error uploading image:', error)
    return { error: error.message }
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return {
    path: data.path,
    url: urlData.publicUrl,
  }
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(path, bucket = 'articles') {
  const supabase = await createClient()

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    console.error('Error deleting image:', error)
    return { error: error.message }
  }

  return { success: true }
}

/**
 * List images in a bucket/folder
 */
export async function listImages(bucket = 'articles', folder = '') {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    })

  if (error) {
    console.error('Error listing images:', error)
    return { images: [], error: error.message }
  }

  // Filter out folders and get public URLs
  const images = (data || [])
    .filter(item => item.id) // Filter out folders
    .map(item => {
      const path = folder ? `${folder}/${item.name}` : item.name
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path)

      return {
        id: item.id,
        name: item.name,
        path,
        url: urlData.publicUrl,
        created_at: item.created_at,
        size: item.metadata?.size,
      }
    })

  return { images }
}

/**
 * Get storage URL for a path
 */
export async function getStorageUrl(path, bucket = 'articles') {
  const supabase = await createClient()

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}
