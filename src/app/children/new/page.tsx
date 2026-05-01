'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { createChild } from '@/lib/data'
import type { Gender } from '@/types'

export default function NewChildPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState<Gender>('male')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
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
        setError('Unable to identify your school.')
        setLoading(false)
        return
      }

      await createChild({
        school_id: coachData.school_id,
        full_name: fullName,
        date_of_birth: dateOfBirth,
        gender,
        notes,
      })

      router.push('/children')
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="section" style={{ paddingTop: '1.5rem' }}>
      <div className="section-hdr" style={{ marginBottom: 16 }}>
        <div>
          <p className="section-title">New child</p>
          <h1 style={{ margin: '8px 0 0' }}>Register learner</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700 }}>Full name</label>
          <input
            className="input"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            placeholder="Sibusiso Ngcobo"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700 }}>Date of birth</label>
          <input
            className="input"
            type="date"
            value={dateOfBirth}
            onChange={e => setDateOfBirth(e.target.value)}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700 }}>Gender</label>
          <select className="input" value={gender} onChange={e => setGender(e.target.value as Gender)}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700 }}>Notes</label>
          <textarea
            className="input"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            placeholder="Add classroom or parent notes"
          />
        </div>

        {error && (
          <div className="card" style={{ borderColor: 'rgba(220,38,38,0.25)', color: '#9b1c1c' }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save child'}
        </button>
      </form>
    </div>
  )
}
