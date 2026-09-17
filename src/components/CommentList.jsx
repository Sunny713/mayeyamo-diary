import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { buildCommentTree } from '../lib/dataModel.js'
import Avatar from './Avatar.jsx'
import RemoteImage from './RemoteImage.jsx'
import Lightbox from './Lightbox.jsx'
import CommentForm from './CommentForm.jsx'

export default function CommentList({ comments, onReply }) {
  const [lightboxPath, setLightboxPath] = useState(null)
  if (!comments || comments.length === 0) {
    return <p className="comment-empty">아직 댓글이 없어요. 첫 댓글을 남겨보세요.</p>
  }
  const tree = buildCommentTree(comments)
  return (
    <>
      <ul className="comment-list">
        {tree.map((c) => (
          <CommentItem key={c.id} comment={c} onReply={onReply} onImageClick={setLightboxPath} />
        ))}
      </ul>
      <Lightbox path={lightboxPath} onClose={() => setLightboxPath(null)} />
    </>
  )
}

function CommentItem({ comment: c, onReply, onImageClick }) {
  const auth = useAuth()
  const [replying, setReplying] = useState(false)
  const member = auth.members.find((m) => m.id === c.author)

  async function handleReplySubmit(payload) {
    await onReply(c.id, payload)
    setReplying(false)
  }

  return (
    <li className="comment-item">
      <Avatar member={member} size={26} />
      <div className="comment-body">
        <div className="comment-meta">
          <span className="comment-author">{member?.displayName || c.author}</span>
          <span className="comment-time">{formatTime(c.createdAt)}</span>
        </div>
        {c.text && <p className="comment-text">{c.text}</p>}
        {c.image && (
          <button
            type="button" className="comment-image-btn"
            onClick={() => onImageClick(c.image)} aria-label="사진 크게 보기"
          >
            <RemoteImage path={c.image} className="comment-image" />
          </button>
        )}
        {onReply && (
          <button type="button" className="comment-reply-btn" onClick={() => setReplying((v) => !v)}>
            {replying ? '취소' : '답글'}
          </button>
        )}
        {replying && (
          <CommentForm
            onSubmit={handleReplySubmit}
            placeholder={`${member?.displayName || c.author}님에게 답글...`}
            submitLabel="답글 등록"
            compact
            autoFocus
          />
        )}
        {c.replies && c.replies.length > 0 && (
          <ul className="comment-list comment-replies">
            {c.replies.map((r) => (
              <CommentItem key={r.id} comment={r} onReply={onReply} onImageClick={onImageClick} />
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getMonth() + 1}.${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
