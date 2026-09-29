import { useEffect, useState } from 'react'
import { useDocumentOperation, type DocumentActionComponent } from 'sanity'
import { nextRemovedHistory } from '../homepageHistory'

// Publishes the Homepage and, in the same step, records which articles were
// taken off it so they lead the "Ultime notizie" column on the site.
export const HomepagePublishAction: DocumentActionComponent = (props) => {
  const { patch, publish } = useDocumentOperation(props.id, props.type)
  const [isPublishing, setIsPublishing] = useState(false)

  useEffect(() => {
    if (isPublishing && !props.draft) setIsPublishing(false)
  }, [isPublishing, props.draft])

  return {
    label: isPublishing ? 'Pubblicazione…' : 'Pubblica',
    tone: 'positive',
    disabled: Boolean(publish.disabled) || isPublishing,
    onHandle: () => {
      setIsPublishing(true)
      const history = nextRemovedHistory(props.published as never, props.draft as never)
      if (history) patch.execute([{ set: { recentlyRemoved: history } }])
      publish.execute()
      props.onComplete()
    },
  }
}
HomepagePublishAction.action = 'publish'
