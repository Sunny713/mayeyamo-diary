import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { loadImageDataUrl } from '../lib/imageCache.js'

export default function RemoteImage({ path, className, alt }) {
  const auth = useAuth()
  const [src, setSrc] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    setSrc(null)
    setError(false)
    if (!path) return
    let cancelled = false
    loadImageDataUrl(auth.client, path)
      .then((dataUrl) => {
        if (!cancelled) setSrc(dataUrl)
      })
      .catch(() => !cancelled && setError(true))
    return () => { cancelled = true }
  }, [path])

  if (!path) return null
  if (error) return <p className="comment-image-error">이미지를 불러오지 못했어요.</p>
  if (!src) return <div className={`${className || ''} skeleton`} />
  return <img className={className} src={src} alt={alt || '첨부 이미지'} loading="lazy" />
}
