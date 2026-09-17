import DOMPurify from 'dompurify'

// 에디터가 실제로 만들어내는 태그/속성만 허용합니다. (스키마 밖 HTML 유입 방지)
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 's', 'a',
    'ul', 'ol', 'li', 'h2', 'h3', 'blockquote', 'code', 'pre', 'img',
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'data-repo-path', 'alt', 'width'],
}

export function sanitizeContentHtml(html) {
  return DOMPurify.sanitize(html || '', SANITIZE_CONFIG)
}

export function isContentEmpty(html) {
  if (!html) return true
  if (/<img[^>]*>/.test(html)) return false
  const text = html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
  return text.length === 0
}
