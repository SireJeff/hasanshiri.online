import { notFound } from 'next/navigation'
import { getArticleForEdit } from '@/lib/actions/articles'
import { getCategories } from '@/lib/actions/categories'
import { getTags } from '@/lib/actions/tags'
import { ArticleForm } from '../../article-form'

export const metadata = {
  title: 'Edit Article | Admin',
}

export default async function EditArticlePage({ params }) {
  const [articleResult, categories, tags] = await Promise.all([
    getArticleForEdit(params.id),
    getCategories(),
    getTags(),
  ])

  if (articleResult.error || !articleResult.article) {
    notFound()
  }

  return (
    <ArticleForm
      article={articleResult.article}
      categories={categories}
      tags={tags}
    />
  )
}
