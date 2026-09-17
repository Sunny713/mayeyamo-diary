import React, { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { loadImageDataUrl } from '../lib/imageCache.js'
import { sanitizeContentHtml } from '../lib/richContent.js'

// 저장된 HTML을 읽기 전용으로 그립니다. data-repo-path가 붙은 <img>는
// 비공개 레포 이미지이므로, DOM에 그린 뒤 GitHub API로 따로 불러와 채워 넣습니다.
export default function RichContent({ html, className, onImageClick }) {
  const auth = useAuth()
  const ref = useRef(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return
    const imgs = container.querySelectorAll('img[data-repo-path]')
    imgs.forEach((img) => {
      const path = img.getAttribute('data-repo-path')
      img.classList.add('rich-content-image')
      if (onImageClick) {
        img.style.cursor = 'zoom-in'
        img.onclick = () => onImageClick(path)
      }
      loadImageDataUrl(auth.client, path)
        .then((dataUrl) => { if (dataUrl) img.src = dataUrl })
        .catch(() => { img.alt = '이미지를 불러오지 못했어요.' })
    })
  }, [html, auth.client, onImageClick])

  if (!html) return null
  const safeHtml = sanitizeContentHtml(html)
  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: safeHtml }} />
}
