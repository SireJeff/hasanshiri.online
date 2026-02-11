require('dotenv').config({ path: '.env.local' })
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('URL length:', url?.length)
console.log('URL:', url)
console.log('Key length:', key?.length)
console.log('Key starts with:', key?.substring(0, 30))
console.log('Key ends with:', key?.substring(key?.length - 30))
console.log('Key contains asterisks ONLY:', key === '***')
console.log('Key === literal asterisks test:', key === '***')
