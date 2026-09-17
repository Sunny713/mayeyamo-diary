import React, { useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useAuth } from '../context/AuthContext.jsx'
import { resizeImageFile } from '../lib/image.js'
import { imagePath } from '../lib/dataModel.js'
import RepoImage from '../lib/repoImageExtension.js'

export default function RichTextEditor({ initialContent, onChange, date, memberId, placeholder }) {
  const auth = useAuth()
  const fileInputRef = useRef(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
      RepoImage,
      Placeholder.configure({ placeholder: placeholder || '오늘 하루는 어땠나요?' }),
    ],
    content: initialContent || '',
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  })

  async function handleInsertImage(e) {
    const file = e.target.files?.[0]
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (!file || !editor) return
    const { base64, extension } = await resizeImageFile(file)
    const path = imagePath(date, memberId, `entry.${extension}`)
    await auth.client.putBase64File(path, base64, { message: `일지 이미지 (${date})` })
    editor.chain().focus().insertContent({ type: 'repoImage', attrs: { path } }).run()
  }

  function setLink() {
    if (!editor) return
    const prev = editor.getAttributes('link').href
    const url = window.prompt('링크 주소를 입력하세요', prev || 'https://')
    if (url === null) return
    if (url.trim() === '') {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().setLink({ href: url.trim() }).run()
  }

  if (!editor) return null

  return (
    <div className="rich-editor">
      <div className="rich-editor-toolbar">
        <button
          type="button" title="굵게"
          className={`rich-editor-btn ${editor.isActive('bold') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
        ><strong>B</strong></button>
        <button
          type="button" title="기울임"
          className={`rich-editor-btn ${editor.isActive('italic') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        ><em>I</em></button>
        <button
          type="button" title="취소선"
          className={`rich-editor-btn ${editor.isActive('strike') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        ><s>S</s></button>
        <span className="rich-editor-divider" />
        <button
          type="button" title="제목"
          className={`rich-editor-btn ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >H</button>
        <button
          type="button" title="목록"
          className={`rich-editor-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >•</button>
        <button
          type="button" title="번호 목록"
          className={`rich-editor-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >1.</button>
        <button
          type="button" title="인용"
          className={`rich-editor-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >&ldquo;</button>
        <span className="rich-editor-divider" />
        <button
          type="button" title="링크"
          className={`rich-editor-btn ${editor.isActive('link') ? 'active' : ''}`}
          onClick={setLink}
        >🔗</button>
        <label className="rich-editor-btn" title="사진 삽입">
          🖼️
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleInsertImage} hidden />
        </label>
      </div>
      <EditorContent editor={editor} className="rich-editor-content" />
    </div>
  )
}
