'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getChild, saveAssessment } from '@/lib/data'
import { scoreAssessment, getAgeBand } from '@/lib/scoring'
import { calcAgeYears } from '@/lib/utils'
import type { Child, ScoringResult } from '@/types'

const initialForm = {
  balance: '0',
  shuttle_run: '0',
  throw_catch: '0',
  jump: '0',
  sessionLabel: '',
}

export default function AssessChildPage() {
  const params = useParams()
  const router = useRouter()
  const childId = params?.childId
  const [child, setChild] = useState<Child | null>(null)
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState<ScoringResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
    setLoading(false)
  }, [childId, router])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!child) return
    const ageBand = getAgeBand(calcAgeYears(child.date_of_birth))
    const scored = scoreAssessment({
      balance: Number(form.balance),
      shuttle_run: Number(form.shuttle_run),
      throw_catch: Number(form.throw_catch),
      jump: Number(form.jump),
    }, ageBand)

    setResult(scored)
  }, [child, form])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!child || !result) return
    setSaving(true)
    setError('')

    try {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      await saveAssessment({
        child,
        coachId: user.id,
        scoringResult: result,
        sessionLabel: form.sessionLabel || undefined,
      })

      router.push(`/children/${child.id}`)
    } catch (err: any) {
      setError(err?.message || 'Unable to save assessment.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="card" style={{ margin: '1.5rem' }}>Loading assessment…</div>
  }

  if (!child) {
    return <div className="card" style={{ margin: '1.5rem' }}>Child not found.</div>
  }

  return (
    <div className="section" style={{ paddingTop: '1.5rem' }}>
      <div className="section-hdr" style={{ marginBottom: 16 }}>
        <div>
          <p className="section-title">Assess</p>
          <h1 style={{ margin: '8px 0 0' }}>Motor screen for {child.full_name}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
        <div>
          <label className="muted" style={{ display: 'block', marginBottom: 6 }}>Session label</label>
          <input
            className="input"
            value={form.sessionLabel}
            onChange={e => setForm({ ...form, sessionLabel: e.target.value })}
            placeholder="Session 1 / Baseline"
          />
        </div>

        <div className="card" style={{ display: 'grid', gap: 12 }}>
          <h3>Enter raw test values</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <label>
              <span style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Balance (seconds)</span>
              <input
                className="input"
                type="number"
                min="0"
                value={form.balance}
                onChange={e => setForm({ ...form, balance: e.target.value })}
              />
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Shuttle run (seconds)</span>
              <input
                className="input"
                type="number"
                min="0"
                value={form.shuttle_run}
                onChange={e => setForm({ ...form, shuttle_run: e.target.value })}
              />
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Throw / catch score</span>
              <input
                className="input"
                type="number"
                min="0"
                value={form.throw_catch}
                onChange={e => setForm({ ...form, throw_catch: e.target.value })}
              />
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Jump distance (cm)</span>
              <input
                className="input"
                type="number"
                min="0"
                value={form.jump}
                onChange={e => setForm({ ...form, jump: e.target.value })}
              />
            </label>
          </div>
        </div>

        {result && (
          <div className="card" style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0 }}>Score preview</h3>
                <p className="muted" style={{ marginTop: 4 }}>Motor score and rating are calculated automatically.</p>
              </div>
              <span className={`badge ${result.overall_rating === 'Excellent' ? 'badge-excellent' : result.overall_rating === 'On track' ? 'badge-ontrack' : 'badge-developing'}`}>
                {result.overall_rating}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <p className="muted" style={{ marginBottom: 6 }}>Total points</p>
                <p style={{ fontWeight: 700 }}>{result.total_points}</p>
              </div>
              <div>
                <p className="muted" style={{ marginBottom: 6 }}>Motor score</p>
                <p style={{ fontWeight: 700 }}>{result.motor_score}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="card" style={{ borderColor: 'rgba(220,38,38,0.25)', color: '#9b1c1c' }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving assessment…' : 'Save assessment'}
        </button>
      </form>
    </div>
  )
}
