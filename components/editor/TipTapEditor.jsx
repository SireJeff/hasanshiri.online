'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Youtube from '@tiptap/extension-youtube'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import { common, createLowlight } from 'lowlight'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Code, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus,
  Link as LinkIcon, Image as ImageIcon, Youtube as YoutubeIcon,
  AlignLeft, AlignCenter, AlignRight,
  Undo, Redo, Highlighter, FileCode2,
} from 'lucide-react'
import { useCallback, useState } from 'react'

const lowlight = createLowlight(common)

export function TipTapEditor({
  content = '',
  onChange,
  placeholder = 'Start writing...',
  editable = true,
  onImageUpload,
}) {
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [showYoutubeModal, setShowYoutubeModal] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Highlight.configure({
        multicolor: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'rounded-lg',
        },
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: 'rounded-lg aspect-video w-full',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  })

  const addImage = useCallback(async () => {
    if (onImageUpload) {
      const url = await onImageUpload()
      if (url && editor) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    } else {
      const url = window.prompt('Image URL')
      if (url && editor) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    }
  }, [editor, onImageUpload])

  const setLink = useCallback(() => {
    if (!editor) return

    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    }
    setShowLinkModal(false)
    setLinkUrl('')
  }, [editor, linkUrl])

  const addYoutube = useCallback(() => {
    if (!editor || !youtubeUrl) return
    editor.commands.setYoutubeVideo({ src: youtubeUrl })
    setShowYoutubeModal(false)
    setYoutubeUrl('')
  }, [editor, youtubeUrl])

  if (!editor) {
    return (
      <div className="border border-border rounded-lg bg-card animate-pulse min-h-[500px]" />
    )
  }

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-border p-2 flex flex-wrap gap-1 bg-secondary/30">
        {/* Text Formatting */}
        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive('highlight')}
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <FileCode2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <Minus className="w-4 h-4" />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarDivider />

        {/* Media */}
        <ToolbarGroup>
          <ToolbarButton
            onClick={() => setShowLinkModal(true)}
            isActive={editor.isActive('link')}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={addImage} title="Add Image">
            <ImageIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setShowYoutubeModal(true)}
            title="Add YouTube Video"
          >
            <YoutubeIcon className="w-4 h-4" />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarDivider />

        {/* Undo/Redo */}
        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>
        </ToolbarGroup>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Link Modal */}
      {showLinkModal && (
        <Modal onClose={() => setShowLinkModal(false)}>
          <h3 className="text-lg font-semibold mb-4">Add Link</h3>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground mb-4"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowLinkModal(false)}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={setLink}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg"
            >
              Add Link
            </button>
          </div>
        </Modal>
      )}

      {/* YouTube Modal */}
      {showYoutubeModal && (
        <Modal onClose={() => setShowYoutubeModal(false)}>
          <h3 className="text-lg font-semibold mb-4">Add YouTube Video</h3>
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground mb-4"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowYoutubeModal(false)}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={addYoutube}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg"
            >
              Add Video
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// Helper Components
function ToolbarGroup({ children }) {
  return <div className="flex gap-0.5">{children}</div>
}

function ToolbarDivider() {
  return <div className="w-px bg-border mx-1" />
}

function ToolbarButton({ onClick, isActive, disabled, title, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded transition-colors ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}

function Modal({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
        {children}
      </div>
    </div>
  )
}

export default TipTapEditor
