import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Typography, Spin, Button, Tabs, Empty, Space, Alert } from 'antd'
import {
  UserOutlined,
  LikeOutlined,
  MessageOutlined,
  CompassOutlined,
  FireOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  LeftOutlined,
  RightOutlined,
  CloseOutlined,
  LoginOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'
import { getTimeline, type TimelineItem, type TimelineMode } from '../services/postService'
import { useAuthStore } from '../stores/authStore'

const { Text } = Typography

// ============ 游客提示卡片 ============
function GuestPromptCard() {
  const navigate = useNavigate()
  const { clearToken } = useAuthStore()

  const handleLogin = () => {
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <Alert
      title="您现在是游客模式"
      description={
        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
            登录后可解锁更多功能！
          </Text>
          <Button type="primary" icon={<LoginOutlined />} onClick={handleLogin}>
            立即登录
          </Button>
        </div>
      }
      type="info"
      showIcon
      closable={false}
    />
  )
}

// ============ 图片查看器组件 ============
function ImageViewer({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: {
  images: Array<{ id: string; name: string }>
  currentIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      {/* 关闭按钮 */}
      <Button
        type="text"
        icon={<CloseOutlined />}
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          color: 'white',
          fontSize: 24,
        }}
      />

      {/* 上一张 */}
      {images.length > 1 && currentIndex > 0 && (
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={(e) => {
            e.stopPropagation()
            onPrev()
          }}
          style={{
            position: 'absolute',
            left: 16,
            color: 'white',
            fontSize: 32,
            height: 64,
            width: 64,
          }}
        />
      )}

      {/* 图片 */}
      <img
        src={`https://api.solian.app/drive/files/${images[currentIndex].id}`}
        alt={images[currentIndex].name}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '90%',
          maxHeight: '90%',
          objectFit: 'contain',
        }}
      />

      {/* 下一张 */}
      {images.length > 1 && currentIndex < images.length - 1 && (
        <Button
          type="text"
          icon={<RightOutlined />}
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          style={{
            position: 'absolute',
            right: 16,
            color: 'white',
            fontSize: 32,
            height: 64,
            width: 64,
          }}
        />
      )}

      {/* 图片指示器 */}
      {images.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            color: 'white',
            fontSize: 14,
          }}
        >
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  )
}

// ============ 帖子卡片 ============
function PostCard({
  item,
  imageIndex,
  onImageIndexChange,
  onOpenImageViewer,
}: {
  item: TimelineItem
  imageIndex: number
  onImageIndexChange: (index: number) => void
  onOpenImageViewer: () => void
}) {
  const post = item.data

  return (
    <Card
      style={{
        borderRadius: 14,
        border: 'none',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}
      styles={{ body: { padding: '16px 20px' } }}
    >
      {/* 发布者信息（头像+昵称） */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        {post.publisher.picture?.id ? (
          <img
            key={post.publisher.picture.id}
            src={`https://api.solian.app/drive/files/${post.publisher.picture.id}`}
            alt={post.publisher.nick}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.nextElementSibling?.removeAttribute('style')
            }}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
        ) : null}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: '#e6e6e6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            color: '#999',
            flexShrink: 0,
            ...(post.publisher.picture?.id ? { display: 'none' } : {}),
          }}
        >
          <UserOutlined />
        </div>
        <div style={{ minWidth: 0, overflow: 'hidden', flex: 1 }}>
          <Text strong style={{ fontSize: 15, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {post.publisher.nick}
          </Text>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            @{post.publisher.name}
          </Text>
        </div>
      </div>

      {/* 帖子标题 */}
      {post.title && (
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
          {post.title}
        </Text>
      )}

      {/* 帖子内容 */}
      {post.content && (
        <Text style={{ fontSize: 14, lineHeight: 1.7, color: '#333', wordBreak: 'break-word', display: 'block', marginBottom: 12 }}>
          {post.content}
        </Text>
      )}

      {/* 附件（图片画廊） */}
      {(() => {
        const images = post.attachments?.filter(
          (att) => att.mimeType?.startsWith('image/')
        ) || []
        if (images.length === 0) return null

        const currentImage = images[imageIndex]

        return (
          <div style={{ marginBottom: 12 }}>
            {/* 当前图片 */}
            <div style={{ position: 'relative' }}>
              <img
                key={currentImage.id}
                src={`https://api.solian.app/drive/files/${currentImage.id}`}
                alt={currentImage.name}
                onClick={onOpenImageViewer}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
                style={{
                  width: '100%',
                  borderRadius: 10,
                  objectFit: 'cover',
                  cursor: 'pointer',
                  maxHeight: 500,
                }}
              />

              {/* 左右切换箭头 */}
              {images.length > 1 && (
                <>
                  {imageIndex > 0 && (
                    <Button
                      type="text"
                      icon={<LeftOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                        onImageIndexChange(imageIndex - 1)
                      }}
                      style={{
                        position: 'absolute',
                        left: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                      }}
                    />
                  )}
                  {imageIndex < images.length - 1 && (
                    <Button
                      type="text"
                      icon={<RightOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                        onImageIndexChange(imageIndex + 1)
                      }}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                      }}
                    />
                  )}
                </>
              )}
            </div>

            {/* 图片指示器 */}
            {images.length > 1 && (
              <div style={{
                marginTop: 10,
                display: 'flex',
                justifyContent: 'center',
                gap: 6,
              }}>
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => onImageIndexChange(idx)}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: idx === imageIndex ? '#1677ff' : '#d9d9d9',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })()}

      {/* 互动信息 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
        <Space size={4}>
          <LikeOutlined style={{ color: '#999', fontSize: 14 }} />
          <Text type="secondary" style={{ fontSize: 13 }}>{post.upvotes}</Text>
        </Space>
        <Space size={4}>
          <MessageOutlined style={{ color: '#999', fontSize: 14 }} />
          <Text type="secondary" style={{ fontSize: 13 }}>{post.repliesCount}</Text>
        </Space>
      </div>
    </Card>
  )
}

// ============ 探索页面 ============
export default function ExplorePage() {
  const [mode, setMode] = useState<TimelineMode>('latest')
  const [items, setItems] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)
  const [imageIndices, setImageIndices] = useState<Record<string, number>>({})
  const [viewerState, setViewerState] = useState<{
    visible: boolean
    postId: string
    currentIndex: number
  } | null>(null)
  const { isGuest } = useAuthStore()

  const observerTarget = useRef<HTMLDivElement>(null)

  // 加载时间线
  const loadTimeline = useCallback(async (reset: boolean = false) => {
    if (loading || loadingMore) return

    if (reset) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const result = await getTimeline({
        take: 10,
        mode,
        cursor: reset ? null : cursor,
        aggressive: true,
      })

      if (reset) {
        setItems(result.items)
        const newIndices: Record<string, number> = {}
        result.items.forEach(item => {
          newIndices[item.id] = 0
        })
        setImageIndices(newIndices)
      } else {
        setItems(prev => [...prev, ...result.items])
        const newIndices: Record<string, number> = { ...imageIndices }
        result.items.forEach(item => {
          newIndices[item.id] = 0
        })
        setImageIndices(newIndices)
      }

      setCursor(result.cursor)
      setHasMore(result.hasMore)
    } catch (error) {
      console.error('Failed to load timeline:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [mode, cursor, loading, loadingMore, imageIndices])

  // 模式切换时重置
  useEffect(() => {
    setItems([])
    setCursor(null)
    setHasMore(true)
    loadTimeline(true)
  }, [mode])

  // 无限滚动加载
  useEffect(() => {
    if (!observerTarget.current || !hasMore || loadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadTimeline(false)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(observerTarget.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, loadTimeline])

  // 获取帖子的图片列表
  const getPostImages = (item: TimelineItem) => {
    return item.data.attachments?.filter(
      (att) => att.mimeType?.startsWith('image/')
    ) || []
  }

  // Tab 项
  const tabItems = [
    { key: 'latest', label: '最新', icon: <ClockCircleOutlined /> },
    { key: 'top', label: '热门', icon: <FireOutlined /> },
    { key: 'personalized', label: '推荐', icon: <CompassOutlined /> },
  ]

  return (
    <div style={{ padding: '20px 24px', maxWidth: 600, margin: '0 auto' }}>
      {/* 游客提示 */}
      {isGuest && <GuestPromptCard />}
      {/* 标题 */}
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          <CompassOutlined style={{ marginRight: 8 }} />
          探索
        </Typography.Title>
      </div>

      {/* 模式切换 */}
      <Tabs
        activeKey={mode}
        onChange={(key) => setMode(key as TimelineMode)}
        items={tabItems}
        style={{ marginBottom: 16 }}
      />

      {/* 帖子列表 */}
      {loading && items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : items.length === 0 ? (
        <Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <Empty description="暂无内容" />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item) => (
            <PostCard
              key={item.id}
              item={item}
              imageIndex={imageIndices[item.id] || 0}
              onImageIndexChange={(index) => {
                setImageIndices(prev => ({ ...prev, [item.id]: index }))
              }}
              onOpenImageViewer={() => {
                const images = getPostImages(item)
                if (images.length > 0) {
                  setViewerState({
                    visible: true,
                    postId: item.id,
                    currentIndex: imageIndices[item.id] || 0,
                  })
                }
              }}
            />
          ))}

          {/* 加载更多 */}
          <div ref={observerTarget} style={{ textAlign: 'center', padding: '20px 0' }}>
            {loadingMore ? (
              <Spin />
            ) : hasMore ? (
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={() => loadTimeline(false)}
              >
                加载更多
              </Button>
            ) : (
              <Text type="secondary">没有更多内容了</Text>
            )}
          </div>
        </div>
      )}

      {/* 图片查看器 */}
      {viewerState?.visible && (() => {
        const item = items.find(i => i.id === viewerState.postId)
        if (!item) return null
        const images = getPostImages(item)
        return (
          <ImageViewer
            images={images}
            currentIndex={viewerState.currentIndex}
            onClose={() => setViewerState(null)}
            onPrev={() => {
              setViewerState(prev => prev ? {
                ...prev,
                currentIndex: (prev.currentIndex - 1 + images.length) % images.length,
              } : null)
            }}
            onNext={() => {
              setViewerState(prev => prev ? {
                ...prev,
                currentIndex: (prev.currentIndex + 1) % images.length,
              } : null)
            }}
          />
        )
      })()}
    </div>
  )
}
