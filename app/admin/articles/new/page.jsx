import { getCategories } from '@/lib/actions/categories'
import { getTags } from '@/lib/actions/tags'
import { ArticleForm } from '../article-form'

export const metadata = {
  title: 'New Article | Admin',
}

export default async function NewArticlePage() {
  const [categories, tags] = await Promise.all([
    getCategories(),
    getTags(),
  ])

  return <ArticleForm categories={categories} tags={tags} />
}
