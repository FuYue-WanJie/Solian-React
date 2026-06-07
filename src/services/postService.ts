
import api from './api'

// Type definitions for Featured Post
export interface FeaturedPost {
  id: string
  title: string | null
  description: string | null
  slug: string | null
  editedAt: string | null
  draftedAt: string | null
  publishedAt: string
  visibility: number
  content: string
  contentType: number
  type: number
  pinMode: unknown | null
  meta: unknown | null
  sensitiveMarks: unknown[]
  embedView: unknown | null
  fediverseUri: unknown | null
  language: unknown | null
  mentions: unknown | null
  boostCount: number
  actorId: unknown | null
  actor: unknown | null
  viewsUnique: number
  viewsTotal: number
  upvotes: number
  downvotes: number
  awardedScore: number
  repliesCount: number
  threadRepliesCount: number
  debugRank: number
  reactionsCount: Record<string, number>
  reactionsMade: Record<string, unknown>
  isBookmarked: boolean
  repliedGone: boolean
  forwardedGone: boolean
  repliedPostId: unknown | null
  repliedPost: unknown | null
  forwardedPostId: unknown | null
  forwardedPost: unknown | null
  quoteAuthorizationId: unknown | null
  realmId: unknown | null
  realm: unknown | null
  attachments: Array<{
    id: string
    name: string
    fileMeta: {
      width: number
      height: number
      blurhash: string
    }
    mimeType: string
    hash: string
    size: number
    url: string | null
    width: number
    height: number
    blurhash: string
    usage: string
  }>
  publisherId: string
  publisher: {
    id: string
    type: number
    name: string
    nick: string
    bio: string
    picture: {
      id: string
      name: string
      fileMeta: {
        blur: string
      }
    }
    background: unknown
    verification: unknown | null
    accountId: string
    realmId: unknown | null
    realm: unknown | null
    account: unknown
  }
}

export async function getFeaturedPosts(): Promise<FeaturedPost[]> {
  const response = await api.get<FeaturedPost[]>('/sphere/posts/featured')
  return response.data
}
