import { render, screen, mockArticle } from '../utils/test-utils'
import { ArticleCard, ArticleCardSkeleton } from '@/components/blog/ArticleCard'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }) => <a href={href}>{children}</a>
})

describe('ArticleCard', () => {
  describe('English locale', () => {
    it('renders article title in English', () => {
      render(<ArticleCard article={mockArticle} locale="en" />)
      expect(screen.getByText('Test Article Title')).toBeInTheDocument()
    })

    it('renders article excerpt in English', () => {
      render(<ArticleCard article={mockArticle} locale="en" />)
      expect(screen.getByText('This is a test excerpt for the article.')).toBeInTheDocument()
    })

    it('renders category name in English', () => {
      render(<ArticleCard article={mockArticle} locale="en" />)
      expect(screen.getByText('Technology')).toBeInTheDocument()
    })

    it('renders reading time', () => {
      render(<ArticleCard article={mockArticle} locale="en" />)
      expect(screen.getByText('5 min read')).toBeInTheDocument()
    })

    it('renders Read more link with correct URL', () => {
      render(<ArticleCard article={mockArticle} locale="en" />)
      const readMoreLink = screen.getByText('Read more')
      expect(readMoreLink.closest('a')).toHaveAttribute('href', '/en/blog/test-article')
    })

    it('renders tags', () => {
      render(<ArticleCard article={mockArticle} locale="en" />)
      expect(screen.getByText('#React')).toBeInTheDocument()
      expect(screen.getByText('#Next.js')).toBeInTheDocument()
    })

    it('renders view count when > 0', () => {
      render(<ArticleCard article={mockArticle} locale="en" />)
      expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('has ltr direction', () => {
      render(<ArticleCard article={mockArticle} locale="en" />)
      const article = screen.getByRole('article')
      expect(article).toHaveAttribute('dir', 'ltr')
    })
  })

  describe('Persian locale', () => {
    it('renders article title in Persian', () => {
      render(<ArticleCard article={mockArticle} locale="fa" />)
      expect(screen.getByText('عنوان آزمایشی مقاله')).toBeInTheDocument()
    })

    it('renders article excerpt in Persian', () => {
      render(<ArticleCard article={mockArticle} locale="fa" />)
      expect(screen.getByText('این یک خلاصه آزمایشی برای مقاله است.')).toBeInTheDocument()
    })

    it('renders category name in Persian', () => {
      render(<ArticleCard article={mockArticle} locale="fa" />)
      expect(screen.getByText('فناوری')).toBeInTheDocument()
    })

    it('renders reading time in Persian', () => {
      render(<ArticleCard article={mockArticle} locale="fa" />)
      expect(screen.getByText('5 دقیقه')).toBeInTheDocument()
    })

    it('renders ادامه مطلب link with correct URL', () => {
      render(<ArticleCard article={mockArticle} locale="fa" />)
      const readMoreLink = screen.getByText('ادامه مطلب')
      expect(readMoreLink.closest('a')).toHaveAttribute('href', '/fa/blog/test-article')
    })

    it('has rtl direction', () => {
      render(<ArticleCard article={mockArticle} locale="fa" />)
      const article = screen.getByRole('article')
      expect(article).toHaveAttribute('dir', 'rtl')
    })
  })

  describe('Featured article', () => {
    it('shows featured badge when article is featured', () => {
      const featuredArticle = { ...mockArticle, is_featured: true }
      render(<ArticleCard article={featuredArticle} locale="en" />)
      expect(screen.getByText('⭐ Featured')).toBeInTheDocument()
    })

    it('shows Persian featured badge in fa locale', () => {
      const featuredArticle = { ...mockArticle, is_featured: true }
      render(<ArticleCard article={featuredArticle} locale="fa" />)
      expect(screen.getByText('⭐ ویژه')).toBeInTheDocument()
    })
  })

  describe('Missing data handling', () => {
    it('renders without featured image', () => {
      const articleWithoutImage = { ...mockArticle, featured_image: null }
      render(<ArticleCard article={articleWithoutImage} locale="en" />)
      expect(screen.getByText('📝')).toBeInTheDocument()
    })

    it('renders without category', () => {
      const articleWithoutCategory = { ...mockArticle, category: null }
      render(<ArticleCard article={articleWithoutCategory} locale="en" />)
      expect(screen.getByText('Test Article Title')).toBeInTheDocument()
    })

    it('renders without tags', () => {
      const articleWithoutTags = { ...mockArticle, tags: [] }
      render(<ArticleCard article={articleWithoutTags} locale="en" />)
      expect(screen.getByText('Test Article Title')).toBeInTheDocument()
    })

    it('does not show view count when 0', () => {
      const articleNoViews = { ...mockArticle, view_count: 0 }
      render(<ArticleCard article={articleNoViews} locale="en" />)
      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })
  })

  describe('Truncated tags', () => {
    it('shows +N when more than 3 tags', () => {
      const articleWithManyTags = {
        ...mockArticle,
        tags: [
          { id: '1', slug: 'tag1', name_en: 'Tag1', name_fa: 'تگ۱' },
          { id: '2', slug: 'tag2', name_en: 'Tag2', name_fa: 'تگ۲' },
          { id: '3', slug: 'tag3', name_en: 'Tag3', name_fa: 'تگ۳' },
          { id: '4', slug: 'tag4', name_en: 'Tag4', name_fa: 'تگ۴' },
          { id: '5', slug: 'tag5', name_en: 'Tag5', name_fa: 'تگ۵' },
        ],
      }
      render(<ArticleCard article={articleWithManyTags} locale="en" />)
      expect(screen.getByText('+2')).toBeInTheDocument()
    })
  })
})

describe('ArticleCardSkeleton', () => {
  it('renders skeleton placeholder', () => {
    const { container } = render(<ArticleCardSkeleton />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
