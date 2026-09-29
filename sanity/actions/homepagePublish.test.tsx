import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

const calls: string[] = []
const patchExecute = vi.fn(() => calls.push('patch'))
const publishExecute = vi.fn(() => calls.push('publish'))

vi.mock('sanity', () => ({
  useDocumentOperation: () => ({
    patch: { execute: patchExecute },
    publish: { execute: publishExecute, disabled: false },
  }),
}))

import { HomepagePublishAction } from './homepagePublish'

describe('HomepagePublishAction', () => {
  it('records the replaced article on the draft before publishing', () => {
    const props = {
      id: 'homepage',
      type: 'homepage',
      published: { topRight: { _ref: 'suppletive' } },
      draft: { topRight: { _ref: 'david-rossi' } },
      onComplete: vi.fn(),
    }
    const { result } = renderHook(() => HomepagePublishAction(props as never))
    result.current!.onHandle!()

    expect(calls).toEqual(['patch', 'publish'])
    const [[patches]] = patchExecute.mock.calls as unknown as [[{ set: { recentlyRemoved: { article: { _ref: string } }[] } }[]]]
    expect(patches[0].set.recentlyRemoved.map((item) => item.article._ref)).toEqual(['suppletive'])
    expect(props.onComplete).toHaveBeenCalled()
  })
})
