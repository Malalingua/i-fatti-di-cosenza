import { useCallback, useEffect, useMemo, useState } from 'react'
import { useClient } from 'sanity'
import { Box, Button, Card, Checkbox, Dialog, Flex, Spinner, Stack, Text } from '@sanity/ui'
import { TrashIcon } from '@sanity/icons'
import { planBulkDelete } from '../bulkDelete'

interface Row {
  _id: string
  title?: string
  category?: string
  publishedAt?: string
}

const LIST_QUERY = `*[_type == "article" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
  _id, title, "category": category->name, publishedAt
}`

export function BulkDeleteArticles() {
  const client = useClient({ apiVersion: '2024-01-01' })
  const [rows, setRows] = useState<Row[] | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ tone: 'positive' | 'critical'; text: string } | null>(null)

  const load = useCallback(async () => {
    setRows(await client.fetch<Row[]>(LIST_QUERY))
    setSelected(new Set())
  }, [client])

  useEffect(() => {
    load()
  }, [load])

  const allSelected = useMemo(() => Boolean(rows?.length) && selected.size === rows?.length, [rows, selected])

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(rows?.map((row) => row._id)))

  const remove = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const ids = [...selected]
      const homepageDocs = await client.fetch(`*[_id in ["homepage", "drafts.homepage"]]`)
      const plan = planBulkDelete(ids, homepageDocs)
      const transaction = client.transaction()
      for (const { id, fields } of plan.unset) transaction.patch(id, (patch) => patch.unset(fields))
      for (const id of plan.deleteIds) transaction.delete(id)
      await transaction.commit()
      setMessage({ tone: 'positive', text: `${ids.length} articoli eliminati.` })
      await load()
    } catch (error) {
      setMessage({ tone: 'critical', text: `Eliminazione non riuscita: ${(error as Error).message}` })
    } finally {
      setBusy(false)
      setConfirming(false)
    }
  }

  if (!rows) {
    return (
      <Flex padding={5} justify="center">
        <Spinner />
      </Flex>
    )
  }

  return (
    <Box padding={4}>
      <Stack space={4}>
        <Flex gap={3} align="center" wrap="wrap">
          <Button
            mode="ghost"
            text={allSelected ? 'Deseleziona tutti' : 'Seleziona tutti'}
            onClick={toggleAll}
            disabled={rows.length === 0 || busy}
          />
          <Button
            tone="critical"
            icon={TrashIcon}
            text={`Elimina selezionati (${selected.size})`}
            onClick={() => setConfirming(true)}
            disabled={selected.size === 0 || busy}
          />
        </Flex>

        {message && (
          <Card padding={3} radius={2} tone={message.tone}>
            <Text size={1}>{message.text}</Text>
          </Card>
        )}

        {rows.length === 0 ? (
          <Text muted>Nessun articolo.</Text>
        ) : (
          <Stack space={1}>
            {rows.map((row) => (
              <Card key={row._id} padding={2} radius={2} tone={selected.has(row._id) ? 'caution' : 'default'}>
                <Flex gap={3} align="center" as="label" style={{ cursor: 'pointer' }}>
                  <Checkbox checked={selected.has(row._id)} onChange={() => toggle(row._id)} disabled={busy} />
                  <Stack space={2} flex={1}>
                    <Text size={1} weight="medium" textOverflow="ellipsis">
                      {row.title || 'Senza titolo'}
                    </Text>
                    <Text size={1} muted>
                      {[row.category, row.publishedAt && new Date(row.publishedAt).toLocaleDateString('it-IT')]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </Stack>
                </Flex>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      {confirming && (
        <Dialog
          id="confirm-bulk-delete"
          header="Eliminare gli articoli?"
          onClose={() => !busy && setConfirming(false)}
          footer={
            <Flex gap={2} justify="flex-end" padding={3}>
              <Button mode="ghost" text="Annulla" onClick={() => setConfirming(false)} disabled={busy} />
              <Button
                tone="critical"
                icon={TrashIcon}
                text={busy ? 'Eliminazione…' : `Elimina ${selected.size} articoli`}
                onClick={remove}
                disabled={busy}
              />
            </Flex>
          }
        >
          <Box padding={4}>
            <Text>
              Stai per eliminare definitivamente {selected.size} articoli. Spariranno dal sito e dalla Homepage e
              non si possono recuperare.
            </Text>
          </Box>
        </Dialog>
      )}
    </Box>
  )
}
