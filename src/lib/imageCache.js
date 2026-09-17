// 저장소의 이미지 파일(private repo, 인증 필요)을 data URL로 가져와 캐시합니다.
// RemoteImage와 에디터 인라인 이미지가 이 캐시를 공유합니다.

const cache = new Map()

export function guessMime(path) {
  if (path.endsWith('.gif')) return 'image/gif'
  if (path.endsWith('.png')) return 'image/png'
  return 'image/jpeg'
}

export async function loadImageDataUrl(client, path) {
  if (!path) return null
  if (cache.has(path)) return cache.get(path)
  const base64 = await client.getBase64File(path)
  if (!base64) return null
  const dataUrl = `data:${guessMime(path)};base64,${base64}`
  cache.set(path, dataUrl)
  return dataUrl
}
