// 저장소 안의(비공개, 인증 필요) 이미지를 에디터/본문에 삽입하기 위한 커스텀 노드.
// 일반 <img src="..."> 대신 data-repo-path 속성에 레포 경로만 저장하고,
// 실제 픽셀 데이터는 화면에 그릴 때(에디터 노드뷰 / RichContent) GitHub API로 따로 불러옵니다.
import Image from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'
import RepoImageView from '../components/RepoImageView.jsx'

const RepoImage = Image.extend({
  name: 'repoImage',

  addAttributes() {
    return {
      path: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-repo-path'),
        renderHTML: (attrs) => (attrs.path ? { 'data-repo-path': attrs.path } : {}),
      },
      // 사용자가 에디터에서 드래그로 조절한 표시 너비(px). 없으면 원본 비율대로 보여줍니다.
      width: {
        default: null,
        parseHTML: (el) => {
          const w = el.getAttribute('width')
          return w ? Number(w) : null
        },
        renderHTML: (attrs) => (attrs.width ? { width: Math.round(attrs.width) } : {}),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'img[data-repo-path]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', HTMLAttributes]
  },

  addNodeView() {
    return ReactNodeViewRenderer(RepoImageView)
  },
})

export default RepoImage
