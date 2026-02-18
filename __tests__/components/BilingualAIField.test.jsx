import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BilingualAIField } from '@/components/admin/shared/BilingualAIField'
import { aiTranslate, aiGenerateContent, aiRefineContent } from '@/lib/actions/ai'

// Mock dependencies
jest.mock('@/lib/actions/ai', () => ({
  aiTranslate: jest.fn(),
  aiGenerateContent: jest.fn(),
  aiRefineContent: jest.fn(),
}))

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}))

// Mock child components
jest.mock('@/components/admin/shared/language-tabs', () => ({
  BilingualField: ({ valueEn, valueFa, onChangeEn, onChangeFa, nameEn, nameFa }) => (
    <div data-testid="bilingual-field">
      <input
        data-testid="input-en"
        value={valueEn}
        onChange={(e) => onChangeEn(e.target.value)}
        name={nameEn}
      />
      <input
        data-testid="input-fa"
        value={valueFa}
        onChange={(e) => onChangeFa(e.target.value)}
        name={nameFa}
      />
    </div>
  ),
}))

jest.mock('@/components/admin/shared/AITranslateButton', () => ({
  AITranslateButton: ({ onTranslate, disabled }) => (
    <button
      data-testid="translate-button"
      onClick={onTranslate}
      disabled={disabled}
    >
      Translate
    </button>
  ),
}))

jest.mock('@/components/admin/shared/AIGenerateButton', () => ({
  AIGenerateButton: ({ onClick, disabled }) => (
    <button
      data-testid="generate-button"
      onClick={onClick}
      disabled={disabled}
    >
      Generate
    </button>
  ),
}))

jest.mock('@/components/admin/shared/AIRefineButton', () => ({
  AIRefineButton: ({ onClick, disabled }) => (
    <button
      data-testid="refine-button"
      onClick={onClick}
      disabled={disabled}
    >
      Refine
    </button>
  ),
}))

describe('BilingualAIField', () => {
  const defaultProps = {
    label: 'Test Field',
    activeTab: 'en',
    nameEn: 'title_en',
    nameFa: 'title_fa',
    valueEn: '',
    valueFa: '',
    onChangeEn: jest.fn(),
    onChangeFa: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the label', () => {
      render(<BilingualAIField {...defaultProps} label="Article Title" />)
      expect(screen.getByText('Article Title')).toBeInTheDocument()
    })

    it('renders required indicator when required', () => {
      render(<BilingualAIField {...defaultProps} required />)
      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('renders translate button when enableTranslate is true', () => {
      render(<BilingualAIField {...defaultProps} enableTranslate />)
      expect(screen.getByTestId('translate-button')).toBeInTheDocument()
    })

    it('hides translate button when enableTranslate is false', () => {
      render(<BilingualAIField {...defaultProps} enableTranslate={false} />)
      expect(screen.queryByTestId('translate-button')).not.toBeInTheDocument()
    })

    it('renders generate button when enableGenerate is true', () => {
      render(<BilingualAIField {...defaultProps} enableGenerate />)
      expect(screen.getByTestId('generate-button')).toBeInTheDocument()
    })

    it('renders refine button when enableRefine is true', () => {
      render(<BilingualAIField {...defaultProps} enableRefine />)
      expect(screen.getByTestId('refine-button')).toBeInTheDocument()
    })

    it('renders bilingual field component', () => {
      render(<BilingualAIField {...defaultProps} />)
      expect(screen.getByTestId('bilingual-field')).toBeInTheDocument()
    })
  })

  describe('Translate Action', () => {
    it('calls aiTranslate when translate button is clicked', async () => {
      aiTranslate.mockResolvedValue({
        translated: { title_fa: 'ترجمه شده' },
        success: true,
      })

      render(
        <BilingualAIField
          {...defaultProps}
          valueEn="Hello World"
          enableTranslate
        />
      )

      fireEvent.click(screen.getByTestId('translate-button'))

      await waitFor(() => {
        expect(aiTranslate).toHaveBeenCalledWith({
          direction: 'en2fa',
          title_en: 'Hello World',
        })
      })
    })

    it('disables translate button when value is empty', () => {
      render(
        <BilingualAIField
          {...defaultProps}
          valueEn=""
          enableTranslate
        />
      )

      expect(screen.getByTestId('translate-button')).toBeDisabled()
    })

    it('enables translate button when value exists', () => {
      render(
        <BilingualAIField
          {...defaultProps}
          valueEn="Some text"
          enableTranslate
        />
      )

      expect(screen.getByTestId('translate-button')).not.toBeDisabled()
    })

    it('updates target field on successful translation', async () => {
      const onChangeFa = jest.fn()
      aiTranslate.mockResolvedValue({
        translated: { title_fa: 'ترجمه شده' },
        success: true,
      })

      render(
        <BilingualAIField
          {...defaultProps}
          valueEn="Hello"
          onChangeFa={onChangeFa}
          enableTranslate
        />
      )

      fireEvent.click(screen.getByTestId('translate-button'))

      await waitFor(() => {
        expect(onChangeFa).toHaveBeenCalledWith('ترجمه شده')
      })
    })
  })

  describe('Generate Action', () => {
    it('calls aiGenerateContent when generate button is clicked', async () => {
      aiGenerateContent.mockResolvedValue({
        title_en: 'Generated Title',
        success: true,
      })

      render(
        <BilingualAIField
          {...defaultProps}
          valueFa="متن فارسی"
          enableGenerate
        />
      )

      fireEvent.click(screen.getByTestId('generate-button'))

      await waitFor(() => {
        expect(aiGenerateContent).toHaveBeenCalledWith(
          expect.objectContaining({
            targetLang: 'en',
            tone: 'professional',
          })
        )
      })
    })
  })

  describe('Refine Action', () => {
    it('calls aiRefineContent when refine button is clicked', async () => {
      aiRefineContent.mockResolvedValue({
        refined: 'Refined content',
        success: true,
      })

      render(
        <BilingualAIField
          {...defaultProps}
          valueEn="Original content"
          enableRefine
        />
      )

      fireEvent.click(screen.getByTestId('refine-button'))

      await waitFor(() => {
        expect(aiRefineContent).toHaveBeenCalledWith({
          content: 'Original content',
          instructions: 'Improve clarity, grammar, flow, and engagement.',
        })
      })
    })

    it('disables refine button when value is empty', () => {
      render(
        <BilingualAIField
          {...defaultProps}
          valueEn=""
          enableRefine
        />
      )

      expect(screen.getByTestId('refine-button')).toBeDisabled()
    })

    it('updates field on successful refinement', async () => {
      const onChangeEn = jest.fn()
      aiRefineContent.mockResolvedValue({
        refined: 'Improved content',
        success: true,
      })

      render(
        <BilingualAIField
          {...defaultProps}
          valueEn="Original"
          onChangeEn={onChangeEn}
          enableRefine
        />
      )

      fireEvent.click(screen.getByTestId('refine-button'))

      await waitFor(() => {
        expect(onChangeEn).toHaveBeenCalledWith('Improved content')
      })
    })
  })

  describe('RTL Support', () => {
    it('uses Persian instructions when active tab is fa', async () => {
      aiRefineContent.mockResolvedValue({
        refined: 'محتوای بهبود یافته',
        success: true,
      })

      render(
        <BilingualAIField
          {...defaultProps}
          activeTab="fa"
          valueFa="متن فارسی"
          enableRefine
        />
      )

      fireEvent.click(screen.getByTestId('refine-button'))

      await waitFor(() => {
        expect(aiRefineContent).toHaveBeenCalledWith(
          expect.objectContaining({
            instructions: expect.stringContaining('بهبودن'),
          })
        )
      })
    })
  })

  describe('Loading States', () => {
    it('disables all buttons while translating', async () => {
      aiTranslate.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(
        <BilingualAIField
          {...defaultProps}
          valueEn="Test"
          enableTranslate
          enableGenerate
          enableRefine
        />
      )

      fireEvent.click(screen.getByTestId('translate-button'))

      await waitFor(() => {
        expect(screen.getByTestId('generate-button')).toBeDisabled()
        expect(screen.getByTestId('refine-button')).toBeDisabled()
      })
    })
  })
})
