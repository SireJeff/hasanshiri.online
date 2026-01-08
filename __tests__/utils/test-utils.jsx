import { render } from '@testing-library/react'

// Create a custom render function that wraps components with necessary providers
function customRender(ui, options = {}) {
  const { locale = 'en', ...renderOptions } = options

  function Wrapper({ children }) {
    return (
      <div dir={locale === 'fa' ? 'rtl' : 'ltr'} lang={locale}>
        {children}
      </div>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'

// Override the render method
export { customRender as render }

// Mock article data for tests
export const mockArticle = {
  id: '1',
  slug: 'test-article',
  title_en: 'Test Article Title',
  title_fa: 'عنوان آزمایشی مقاله',
  excerpt_en: 'This is a test excerpt for the article.',
  excerpt_fa: 'این یک خلاصه آزمایشی برای مقاله است.',
  content_en: '<p>Test content</p>',
  content_fa: '<p>محتوای آزمایشی</p>',
  featured_image: '/images/test.jpg',
  published_at: '2024-01-15T10:00:00Z',
  reading_time_minutes: 5,
  view_count: 100,
  is_featured: false,
  status: 'published',
  category: {
    id: '1',
    slug: 'technology',
    name_en: 'Technology',
    name_fa: 'فناوری',
    color: '#3b82f6',
  },
  tags: [
    { id: '1', slug: 'react', name_en: 'React', name_fa: 'ری‌اکت' },
    { id: '2', slug: 'nextjs', name_en: 'Next.js', name_fa: 'نکست' },
  ],
  author: {
    id: '1',
    full_name: 'Hassan Shiri',
    avatar_url: null,
  },
}

// Mock comment data
export const mockComment = {
  id: '1',
  content: 'This is a test comment.',
  author_name: 'Test User',
  author_email: 'test@example.com',
  created_at: '2024-01-15T10:00:00Z',
  status: 'approved',
  parent_id: null,
  replies: [],
  user_id: null,
  user: null,
}

// Mock chat message data
export const mockChatMessage = {
  id: '1',
  session_id: 'session-123',
  sender_type: 'user',
  sender_name: 'Test User',
  sender_email: 'test@example.com',
  message: 'Hello, this is a test message.',
  read_at: null,
  created_at: '2024-01-15T10:00:00Z',
}

// Mock category data
export const mockCategory = {
  id: '1',
  slug: 'technology',
  name_en: 'Technology',
  name_fa: 'فناوری',
  description_en: 'Tech articles',
  description_fa: 'مقالات فناوری',
  color: '#3b82f6',
}

// Mock tag data
export const mockTag = {
  id: '1',
  slug: 'react',
  name_en: 'React',
  name_fa: 'ری‌اکت',
}
