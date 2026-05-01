'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { getChild, getAssessmentsForChild } from '@/lib/data'
import { formatDate } from '@/lib/utils'
import type { AssessmentWithResults, Child } from '@/types'

export default function ChildProfilePage() {
  const params = useParams()
  const router = useRouter()
  const childId = params?.id
  const [child, setChild] = useState<Child | null>(null)
  const [assessments, setAssessments] = useState<AssessmentWithResults[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!childId || Array.isArray(childId)) return
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const selectedChild = await getChild(childId)
    setChild(selectedChild)
    const childAssessments = await getAssessmentsForChild(childId)
    setAssessments(childAssessments)
    setLoading(false)
  }, [childId, router])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return <div className="card" style={{ margin: '1.5rem' }}>Loading child profile…</div>
  }

  if (!child) {
    return <div className="card" style={{ margin: '1.5rem' }}>Child not found.</div>
  }

  return (
    <div className="section" style={{ paddingTop: '1.5rem' }}>
      <div className="section-hdr" style={{ marginBottom: 16 }}>
        <div>
          <p className="section-title">Child profile</p>
          <h1 style={{ margin: '8px 0 0' }}>{child.full_name}</h1>
          <p className="muted" style={{ marginTop: 6 }}>
            Born {formatDate(child.date_of_birth)} · {child.unique_code}
          </p>
        </div>
        <Link href={`/assess/${child.id}`} className="btn-primary">
          Assess learner
        </Link>
      </div>

      {child.notes ? (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 8 }}>Notes</h3>
          <p style={{ color: 'var(--muted)' }}>{child.notes}</p>
        </div>
      ) : null}

      <div className="section">
        <div className="section-hdr">
          <span className="section-title">Recent assessments</span>
        </div>

        {assessments.length === 0 ? (
          <div className="card">
            <p className="muted">No assessments have been recorded for this child yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {assessments.map(assessment => (
              <div key={assessment.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>{assessment.session_label || 'Assessment session'}</p>
                    <p className="muted" style={{ marginTop: 4 }}>
                      {formatDate(assessment.assessed_on)} · Score {assessment.motor_score ?? '–'}
                    </p>
                  </div>
                  <span className={`badge ${assessment.overall_rating === 'Excellent' ? 'badge-excellent' : assessment.overall_rating === 'On track' ? 'badge-ontrack' : 'badge-developing'}`}>
                    {assessment.overall_rating || 'Pending'}
                  </span>
                </div>
                {assessment.report ? (
                  <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
                    Report available · share token: {assessment.report.share_token}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
