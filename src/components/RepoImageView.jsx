import React, { useEffect, useRef, useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { useAuth } from '../context/AuthContext.jsx'
import { loadImageDataUrl } from '../lib/imageCache.js'

const MIN_WIDTH = 60
const MAX_WIDTH = 640

export default function RepoImageView({ node, updateAttributes, selected }) {
  const auth = useAuth()
  const path = node.attrs.path
  const width = node.attrs.width
  const [src, setSrc] = useState(null)
  const [error, setError] = useState(false)
  const imgRef = useRef(null)
  const dragRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    setSrc(null)
    setError(false)
    loadImageDataUrl(auth.client, path)
      .then((dataUrl) => { if (!cancelled) setSrc(dataUrl) })
      .catch(() => !cancelled && setError(true))
    return () => { cancelled = true }
  }, [path])

  function startResize(e) {
    e.preventDefault()
    e.stopPropagation()
    const startWidth = imgRef.current?.offsetWidth || width || 240
    dragRef.current = { startX: e.clientX, startWidth }
    window.addEventListener('mousemove', onDrag)
    window.addEventListener('mouseup', stopResize)
  }

  function onDrag(e) {
    if (!dragRef.current) return
    const { startX, startWidth } = dragRef.current
    const next = Math.round(startWidth + (e.clientX - startX))
    updateAttributes({ width: Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, next)) })
  }

  function stopResize() {
    dragRef.current = null
    window.removeEventListener('mousemove', onDrag)
    window.removeEventListener('mouseup', stopResize)
  }

  return (
    <NodeViewWrapper className={`editor-image-node ${selected ? 'is-selected' : ''}`} contentEditable={false}>
      {error ? (
        <span className="comment-image-error">이미지를 불러오지 못했어요.</span>
      ) : src ? (
        <span className="editor-image-frame">
          <img
            ref={imgRef}
            src={src}
            alt="일지 이미지"
            className="editor-image"
            style={width ? { width: `${width}px`, height: 'auto' } : undefined}
          />
          {selected && (
            <span
              className="editor-image-resize-handle"
              onMouseDown={startResize}
              title="드래그해서 크기 조절"
            />
          )}
        </span>
      ) : (
        <div className="editor-image skeleton" />
      )}
    </NodeViewWrapper>
  )
}
