// Keep Tab inside the task instead of letting it reach the browser chrome.
// Native showModal still provides the inert background and Escape behavior.
export function trapDialogFocus(event) {
  if (event.key !== 'Tab') return
  const elements = [...event.currentTarget.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]')]
    .filter((element) => element.getClientRects().length > 0)
  const first = elements[0]
  const last = elements.at(-1)
  if (!first) return
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
