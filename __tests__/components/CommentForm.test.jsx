import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import userEvent from '@testing-library/user-event'
import { CommentForm } from '@/components/comments/CommentForm'

// Mock the createComment action
jest.mock('@/lib/actions/comments', () => ({
  createComment: jest.fn(),
}))

import { createComment } from '@/lib/actions/comments'

describe('CommentForm', () => {
  const defaultProps = {
    articleId: '123',
    user: null,
    locale: 'en',
    parentId: null,
    onCommentAdded: jest.fn(),
    onCancel: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Guest mode (not logged in)', () => {
    it('renders name and email fields for guests', () => {
      render(<CommentForm {...defaultProps} />)

      expect(screen.getByPlaceholderText('Your name *')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Your email *')).toBeInTheDocument()
    })

    it('renders textarea for comment', () => {
      render(<CommentForm {...defaultProps} />)

      expect(screen.getByPlaceholderText('Share your thoughts...')).toBeInTheDocument()
    })

    it('renders Post Comment button', () => {
      render(<CommentForm {...defaultProps} />)

      expect(screen.getByRole('button', { name: /post comment/i })).toBeInTheDocument()
    })

    it('shows character count', () => {
      render(<CommentForm {...defaultProps} />)

      expect(screen.getByText('0/2000')).toBeInTheDocument()
    })

    it('updates character count when typing', async () => {
      const user = userEvent.setup()
      render(<CommentForm {...defaultProps} />)

      const textarea = screen.getByPlaceholderText('Share your thoughts...')
      await user.type(textarea, 'Hello')

      expect(screen.getByText('5/2000')).toBeInTheDocument()
    })

    it('shows privacy note for guests', () => {
      render(<CommentForm {...defaultProps} />)

      expect(
        screen.getByText(/your email will not be published/i)
      ).toBeInTheDocument()
    })

    it('shows error when submitting empty comment', async () => {
      const user = userEvent.setup()
      render(<CommentForm {...defaultProps} />)

      // Fill name and email but not comment
      await user.type(screen.getByPlaceholderText('Your name *'), 'Test User')
      await user.type(screen.getByPlaceholderText('Your email *'), 'test@example.com')

      // Submit - button should be disabled with empty content
      const submitButton = screen.getByRole('button', { name: /post comment/i })
      expect(submitButton).toBeDisabled()
    })

    it('shows error when name and email are missing', async () => {
      const user = userEvent.setup()
      render(<CommentForm {...defaultProps} />)

      // Type comment content
      await user.type(screen.getByPlaceholderText('Share your thoughts...'), 'Test comment')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /post comment/i })
      await user.click(submitButton)

      expect(screen.getByText('Name and email are required')).toBeInTheDocument()
    })

    it('submits comment successfully', async () => {
      createComment.mockResolvedValue({
        success: true,
        message: 'Comment submitted successfully',
        comment: { id: '1', content: 'Test comment' },
        isPending: true,
      })

      const user = userEvent.setup()
      const onCommentAdded = jest.fn()
      render(<CommentForm {...defaultProps} onCommentAdded={onCommentAdded} />)

      await user.type(screen.getByPlaceholderText('Your name *'), 'Test User')
      await user.type(screen.getByPlaceholderText('Your email *'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Share your thoughts...'), 'Test comment')

      await user.click(screen.getByRole('button', { name: /post comment/i }))

      await waitFor(() => {
        expect(createComment).toHaveBeenCalledWith({
          articleId: '123',
          content: 'Test comment',
          parentId: null,
          guestName: 'Test User',
          guestEmail: 'test@example.com',
          website_url: '', // Honeypot field is empty string
        })
      })
    })

    it('contains honeypot field', () => {
      const { container } = render(<CommentForm {...defaultProps} />)

      const honeypotInput = container.querySelector('#website_url_main')
      expect(honeypotInput).toBeInTheDocument()
      expect(honeypotInput).toHaveAttribute('tabindex', '-1')
    })
  })

  describe('Logged in user mode', () => {
    const loggedInUser = {
      id: 'user-123',
      email: 'user@example.com',
      user_metadata: {
        full_name: 'John Doe',
        avatar_url: null,
      },
    }

    it('shows user info when logged in', () => {
      render(<CommentForm {...defaultProps} user={loggedInUser} />)

      expect(screen.getByText(/commenting as/i)).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('does not show name/email fields when logged in', () => {
      render(<CommentForm {...defaultProps} user={loggedInUser} />)

      expect(screen.queryByPlaceholderText('Your name *')).not.toBeInTheDocument()
      expect(screen.queryByPlaceholderText('Your email *')).not.toBeInTheDocument()
    })

    it('does not show privacy note when logged in', () => {
      render(<CommentForm {...defaultProps} user={loggedInUser} />)

      expect(
        screen.queryByText(/your email will not be published/i)
      ).not.toBeInTheDocument()
    })
  })

  describe('Reply mode', () => {
    it('shows Post Reply button for replies', () => {
      render(<CommentForm {...defaultProps} parentId="parent-123" />)

      expect(screen.getByRole('button', { name: /post reply/i })).toBeInTheDocument()
    })

    it('shows reply placeholder', () => {
      render(<CommentForm {...defaultProps} parentId="parent-123" />)

      expect(screen.getByPlaceholderText('Write your reply...')).toBeInTheDocument()
    })

    it('shows cancel button when onCancel provided', () => {
      const onCancel = jest.fn()
      render(<CommentForm {...defaultProps} parentId="parent-123" onCancel={onCancel} />)

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('calls onCancel when cancel clicked', async () => {
      const user = userEvent.setup()
      const onCancel = jest.fn()
      render(<CommentForm {...defaultProps} parentId="parent-123" onCancel={onCancel} />)

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(onCancel).toHaveBeenCalled()
    })
  })

  describe('Persian locale', () => {
    it('shows Persian placeholder', () => {
      render(<CommentForm {...defaultProps} locale="fa" />)

      expect(screen.getByPlaceholderText('نظر خود را بنویسید...')).toBeInTheDocument()
    })

    it('shows Persian button text', () => {
      render(<CommentForm {...defaultProps} locale="fa" />)

      expect(screen.getByRole('button', { name: /ارسال نظر/i })).toBeInTheDocument()
    })

    it('shows Persian error messages', async () => {
      const user = userEvent.setup()
      render(<CommentForm {...defaultProps} locale="fa" />)

      await user.type(screen.getByPlaceholderText('نظر خود را بنویسید...'), 'تست')
      await user.click(screen.getByRole('button', { name: /ارسال نظر/i }))

      expect(screen.getByText('نام و ایمیل الزامی است')).toBeInTheDocument()
    })
  })

  describe('Error handling', () => {
    it('shows error from server', async () => {
      createComment.mockResolvedValue({
        error: 'Server error occurred',
      })

      const user = userEvent.setup()
      render(<CommentForm {...defaultProps} />)

      await user.type(screen.getByPlaceholderText('Your name *'), 'Test User')
      await user.type(screen.getByPlaceholderText('Your email *'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Share your thoughts...'), 'Test comment')

      await user.click(screen.getByRole('button', { name: /post comment/i }))

      await waitFor(() => {
        expect(screen.getByText('Server error occurred')).toBeInTheDocument()
      })
    })
  })
})
