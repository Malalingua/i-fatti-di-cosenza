'use client'

import { useState } from 'react'

export function CosentineTranslator() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const charCount = input.length
  const maxChars = 300
  const isOverLimit = charCount > maxChars

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isOverLimit) return

    setLoading(true)
    setError('')
    setOutput('')

    try {
      const res = await fetch('/api/translate-cosentino', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Errore durante la traduzione')
        return
      }

      setOutput(data.translation)
    } catch {
      setError('Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg bg-neutral-50 p-6 text-sm">
      <h3 className="mb-4 font-display text-lg font-bold">Traduttore Ironico Cosentino</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Scrivi una frase da tradurre in dialetto cosentino..."
          className="w-full resize-none rounded border border-neutral-300 px-3 py-2 text-sm placeholder-neutral-400 focus:border-neutral-500 focus:outline-none"
          rows={3}
          disabled={loading}
        />
        <div className="flex items-center justify-between">
          <span className={`text-xs ${isOverLimit ? 'text-red-600' : 'text-neutral-500'}`}>
            {charCount}/{maxChars}
            {isOverLimit && ' - Massimo 300 caratteri'}
          </span>
          <button
            type="submit"
            disabled={!input.trim() || isOverLimit || loading}
            className="rounded bg-neutral-900 px-4 py-2 text-xs font-semibold uppercase text-white disabled:bg-neutral-300"
          >
            {loading ? 'Traduzione in corso...' : 'Traduci in Cosentino'}
          </button>
        </div>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {output && (
        <div className="mt-4 rounded-lg border-l-4 border-neutral-900 bg-neutral-100 p-3">
          <p className="text-xs font-semibold uppercase text-neutral-600">Traduzione Cosentina</p>
          <p className="mt-2 italic text-neutral-800">&quot;{output}&quot;</p>
        </div>
      )}
    </div>
  )
}
