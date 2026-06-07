import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Typography, Spin, Tag, Button } from 'antd'
import {
  ArrowLeftOutlined,
  SafetyCertificateOutlined,
  EditOutlined,
  ReadOutlined,
  StarOutlined,
  HeartOutlined,
  BookOutlined,
  TrophyOutlined,
  MedicineBoxOutlined,
  SearchOutlined,
  SkinOutlined,
  ClockCircleOutlined,
  CompassOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FireOutlined,
  BulbOutlined,
} from '@ant-design/icons'
import { getCheckInToday, CHECKIN_LEVELS } from '../services/checkInService'
import type { CheckInResult } from '../services/checkInService'

const { Text } = Typography

const cardStyle: React.CSSProperties = {
  borderRadius: 14,
  border: 'none',
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  overflow: 'hidden',
}

const pillStyle: React.CSSProperties = {
  margin: 0,
  borderRadius: 20,
  padding: '4px 14px',
  fontSize: 13,
  border: 'none',
  background: '#f3f0ff',
  color: '#7c6fca',
}

export default function CheckInDetailPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<CheckInResult | null>(null)

  useEffect(() => {
    getCheckInToday()
      .then((data) => setResult(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ padding: 24, maxWidth: 600, margin: '0 auto', textAlign: 'center', paddingTop: 80 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!result || !result.fortuneReport) {
    return (
      <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
          返回仪表盘
        </Button>
        <Card style={cardStyle} styles={{ body: { padding: 40, textAlign: 'center' } }}>
          <Text type="secondary">暂无签到数据</Text>
        </Card>
      </div>
    )
  }

  const report = result.fortuneReport
  const levelInfo = CHECKIN_LEVELS[typeof result.level === 'number' ? result.level : 0] || CHECKIN_LEVELS[0]

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
      {/* 返回按钮 */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/')}
        style={{ marginBottom: 16, paddingLeft: 0 }}
      >
        返回仪表盘
      </Button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* 签诗卡片 */}
        <Card style={cardStyle} styles={{ body: { padding: '18px 20px' } }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <SafetyCertificateOutlined style={{ fontSize: 20, color: '#9B8FD4' }} />
            <Text strong style={{ fontSize: 17, color: '#1a1a1a' }}>今日签文</Text>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            <Tag style={pillStyle}>
              <BulbOutlined style={{ marginRight: 4 }} />{levelInfo.label}
            </Tag>
            <Tag style={pillStyle}>
              <SkinOutlined style={{ marginRight: 4 }} />{report.luckyColor}
            </Tag>
            <Tag style={pillStyle}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />{report.luckyTime}
            </Tag>
            <Tag style={pillStyle}>
              <CompassOutlined style={{ marginRight: 4 }} />{report.luckyDirection}
            </Tag>
          </div>

          <div style={{ padding: '12px 14px', background: '#faf8ff', borderRadius: 10, marginBottom: 14, overflow: 'hidden' }}>
            <Text style={{ fontSize: 15, fontStyle: 'italic', color: '#555', lineHeight: 1.6, wordBreak: 'break-word' }}>
              {report.poem}
            </Text>
          </div>
        </Card>

        {/* 总评 */}
        <Card style={cardStyle} styles={{ body: { padding: '14px 18px' } }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', overflow: 'hidden' }}>
            <EditOutlined style={{ color: '#1677ff', fontSize: 16, marginTop: 2, flexShrink: 0 }} />
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>总评</Text>
              <Text style={{ fontSize: 14, color: '#555', wordBreak: 'break-word' }}>{report.summary}</Text>
            </div>
          </div>
        </Card>

        {/* 指引 */}
        {report.summaryDetail && (
          <Card style={cardStyle} styles={{ body: { padding: '14px 18px' } }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', overflow: 'hidden' }}>
              <ReadOutlined style={{ color: '#722ed1', fontSize: 16, marginTop: 2, flexShrink: 0 }} />
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>今日指引</Text>
                <Text style={{ fontSize: 14, color: '#555', wordBreak: 'break-word' }}>{report.summaryDetail}</Text>
              </div>
            </div>
          </Card>
        )}

        {/* 宜忌 */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Card style={{ ...cardStyle, flex: 1, minWidth: 0 }} styles={{ body: { padding: '14px 16px' } }}>
            <div style={{ background: '#f6ffed', borderRadius: 8, padding: '10px 12px', borderLeft: '3px solid #52c41a', overflow: 'hidden' }}>
              <Text style={{ fontSize: 13, fontWeight: 500, color: '#389e0d', display: 'block' }}>
                <CheckCircleOutlined style={{ marginRight: 4 }} />宜
              </Text>
              <Text style={{ fontSize: 14, color: '#555', display: 'block', marginTop: 6, wordBreak: 'break-word' }}>
                {report.luckyAction}
              </Text>
            </div>
          </Card>
          <Card style={{ ...cardStyle, flex: 1, minWidth: 0 }} styles={{ body: { padding: '14px 16px' } }}>
            <div style={{ background: '#fff2f0', borderRadius: 8, padding: '10px 12px', borderLeft: '3px solid #ff4d4f', overflow: 'hidden' }}>
              <Text style={{ fontSize: 13, fontWeight: 500, color: '#cf1322', display: 'block' }}>
                <CloseCircleOutlined style={{ marginRight: 4 }} />忌
              </Text>
              <Text style={{ fontSize: 14, color: '#555', display: 'block', marginTop: 6, wordBreak: 'break-word' }}>
                {report.avoidAction}
              </Text>
            </div>
          </Card>
        </div>

        {/* 运势详情 */}
        <Card
          title={<span><SafetyCertificateOutlined style={{ marginRight: 8, color: '#9B8FD4' }} />运势详情</span>}
          style={cardStyle}
          styles={{ body: { padding: '12px 16px' } }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {([
              { icon: <StarOutlined style={{ color: '#faad14' }} />, label: '愿望', value: report.wish },
              { icon: <HeartOutlined style={{ color: '#ff4d4f' }} />, label: '爱情', value: report.love },
              { icon: <BookOutlined style={{ color: '#1677ff' }} />, label: '学业', value: report.study },
              { icon: <TrophyOutlined style={{ color: '#52c41a' }} />, label: '事业', value: report.career },
              { icon: <MedicineBoxOutlined style={{ color: '#13c2c2' }} />, label: '健康', value: report.health },
              { icon: <SearchOutlined style={{ color: '#722ed1' }} />, label: '失物', value: report.lostItem },
            ] as const).map((item) => (
              <div key={item.label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', overflow: 'hidden' }}>
                <span style={{ flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <Text style={{ fontSize: 13, color: '#999', display: 'block' }}>{item.label}</Text>
                  <Text style={{ fontSize: 14, color: '#333', wordBreak: 'break-word' }}>{item.value}</Text>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 小仪式 */}
        <Card style={{ ...cardStyle, background: 'linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%)' }} styles={{ body: { padding: '14px 18px' } }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', overflow: 'hidden' }}>
            <FireOutlined style={{ color: '#d48806', fontSize: 16, marginTop: 2, flexShrink: 0 }} />
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <Text strong style={{ fontSize: 14, color: '#d48806', display: 'block', marginBottom: 4 }}>今日小仪式</Text>
              <Text style={{ fontSize: 14, color: '#5c3d00', wordBreak: 'break-word' }}>{report.ritual}</Text>
            </div>
          </div>
        </Card>

        {/* 所有提示 */}
        {result.tips && result.tips.length > 0 && (
          <Card
            title={<span><BulbOutlined style={{ marginRight: 8 }} />今日提示</span>}
            style={cardStyle}
            styles={{ body: { padding: '12px 16px' } }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {result.tips.map((tip, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: tip.isPositive ? '#f6ffed' : '#fff2f0',
                    borderLeft: `3px solid ${tip.isPositive ? '#52c41a' : '#ff4d4f'}`,
                    overflow: 'hidden',
                  }}
                >
                  <Text
                    strong
                    style={{ fontSize: 14, color: tip.isPositive ? '#389e0d' : '#cf1322', display: 'block', wordBreak: 'break-word' }}
                  >
                    {tip.isPositive ? <CheckCircleOutlined style={{ marginRight: 6 }} /> : <CloseCircleOutlined style={{ marginRight: 6 }} />}
                    {tip.title}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#666', display: 'block', marginTop: 4, wordBreak: 'break-word' }}>
                    {tip.content}
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
