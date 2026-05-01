'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getChildren } from '@/lib/data'
import { formatDate } from '@/lib/utils'
import type { Child } from '@/types'

export default function ChildrenPage() {
  const router = useRouter()
  const [children, setChildren] = useState<Child[]>([])
  const [schoolName, setSchoolName] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: coachData } = await sb
      .from('coaches')
      .select('*, school:schools(*)')
      .eq('id', user.id)
      .single()

    if (!coachData) {
      router.push('/login')
      return
    }

    setSchoolName(coachData.school?.name || '')
    const list = await getChildren(coachData.school_id)
    setChildren(list)
    setLoading(false)
  }, [router])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="card" style={{ margin: '1.5rem' }}>
        Loading children…
      </div>
    )
  }

  return (
    <div className="section">
      <div className="section-hdr" style={{ marginBottom: 10 }}>
        <div>
          <p className="section-title">Children</p>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
            Roster for {schoolName || 'your school'}
          </p>
        </div>
        <Link href="/children/new" className="btn-secondary">
          Add child
        </Link>
      </div>

      {children.length === 0 ? (
        <div className="card" style={{ display: 'grid', gap: 14 }}>
          <p>No children have been registered yet.</p>
          <Link href="/children/new" className="btn-primary">
            Register first child
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {children.map(child => (
            <Link
              href={`/children/${child.id}`}
              key={child.id}
              className="card"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'center' }}>
                <div>
                  <h3>{child.full_name}</h3>
                  <p className="muted" style={{ marginTop: 4 }}>
                    {formatDate(child.date_of_birth)} · {child.unique_code}
                  </p>
                </div>
                <span className="badge badge-good">Profile</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
