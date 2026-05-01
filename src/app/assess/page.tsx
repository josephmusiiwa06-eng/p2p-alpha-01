'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getChildren } from '@/lib/data'
import type { Child } from '@/types'

export default function AssessPage() {
  const router = useRouter()
  const [children, setChildren] = useState<Child[]>([])
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
      .select('school_id')
      .eq('id', user.id)
      .single()

    if (!coachData?.school_id) {
      router.push('/children/new')
      return
    }

    const list = await getChildren(coachData.school_id)
    setChildren(list)
    setLoading(false)
  }, [router])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return <div className="card" style={{ margin: '1.5rem' }}>Loading assessment options…</div>
  }

  return (
    <div className="section" style={{ paddingTop: '1.5rem' }}>
      <div className="section-hdr" style={{ marginBottom: 16 }}>
        <div>
          <p className="section-title">New assessment</p>
          <h1 style={{ margin: '8px 0 0' }}>Select a child</h1>
        </div>
        <Link href="/children/new" className="btn-secondary">
          Add child
        </Link>
      </div>

      {children.length === 0 ? (
        <div className="card">
          <p className="muted">No children are available yet. Register a child first.</p>
          <Link href="/children/new" className="btn-primary" style={{ marginTop: 14 }}>
            Register child
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {children.map(child => (
            <Link
              href={`/assess/${child.id}`}
              key={child.id}
              className="card"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div>
                  <h3>{child.full_name}</h3>
                  <p className="muted" style={{ marginTop: 4 }}>{child.unique_code}</p>
                </div>
                <span className="badge badge-good">Assess</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
