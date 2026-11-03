import { renderHook } from '@testing-library/react'
import { useWarnBeforeUnload } from './useWarnBeforeUnload'

function leavePage(): boolean {
  const event = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(event)
  return event.defaultPrevented
}

describe('useWarnBeforeUnload', () => {
  it('asks for confirmation only while active', () => {
    const { rerender, unmount } = renderHook(({ active }) => useWarnBeforeUnload(active), {
      initialProps: { active: false },
    })
    expect(leavePage()).toBe(false)

    rerender({ active: true })
    expect(leavePage()).toBe(true)

    rerender({ active: false })
    expect(leavePage()).toBe(false)

    rerender({ active: true })
    unmount()
    expect(leavePage()).toBe(false)
  })
})
