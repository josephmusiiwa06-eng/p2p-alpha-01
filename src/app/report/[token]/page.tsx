'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { getReportByToken } from '@/lib/data'

export default function ReportPage() {
  const params = useParams()
  const token = params?.token
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!token) return
    try {
      const data = await getReportByToken(token)
      setReport(data)
    } catch (err: any) {
      setError(err?.message || 'Report not found.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return <div className="card" style={{ margin: '1.5rem' }}>Loading report…</div>
  }

  if (error) {
    return <div className="card" style={{ margin: '1.5rem', color: '#9b1c1c' }}>{error}</div>
  }

  if (!report) {
    return <div className="card" style={{ margin: '1.5rem' }}>No report available.</div>
  }

  const assessment = report.assessment

  return (
    <div className="section" style={{ paddingTop: '1.5rem' }}>
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="section-title">Shareable report</p>
        <h1 style={{ margin: '8px 0 0' }}>{assessment?.child?.full_name || 'Learner report'}</h1>
        <p className="muted" style={{ marginTop: 6 }}>Assessment date: {new Date(assessment?.assessed_on).toLocaleDateString('en-ZA')}</p>
      </div>

      <div className="card" style={{ display: 'grid', gap: 14 }}>
        <div>
          <h3>Strengths</h3>
          <p className="muted">{report.strengths_text || 'No strengths text available.'}</p>
        </div>
        <div>
          <h3>Areas to improve</h3>
          <p className="muted">{report.improve_text || 'No improvement guidance available.'}</p>
        </div>
        <div>
          <h3>Recommendations</h3>
          <p className="muted" style={{ whiteSpace: 'pre-wrap' }}>{report.recommendations || 'No recommendations available.'}</p>
        </div>
        <div style={{ padding: '14px', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
          <p className="muted" style={{ marginBottom: 6 }}>Share token</p>
          <p style={{ wordBreak: 'break-all' }}>{report.share_token}</p>
        </div>
      </div>
    </div>
  )
}
