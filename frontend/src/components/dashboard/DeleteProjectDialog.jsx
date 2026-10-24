import { useEffect, useRef } from 'react'
import Button from '../common/Button'
import { trapDialogFocus } from '../../utils/dialogFocus'

export default function DeleteProjectDialog({ project, onClose, onConfirm }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const previous = document.activeElement
    el.showModal()
    return () => { el.close(); if (previous?.isConnected) previous.focus() }
  }, [])
  return <dialog ref={ref} className="project-dialog !max-w-md p-6" aria-labelledby="delete-title" onKeyDown={trapDialogFocus} onCancel={(e) => { e.preventDefault(); onClose() }}>
    <h2 id="delete-title" className="text-xl font-bold">Delete project?</h2>
    <p className="mt-3 break-words text-sm leading-relaxed text-soft">“{project.name}” and its session activity will be removed. This frees one project space.</p>
    <div className="mt-6 flex justify-end gap-3"><Button variant="soft" onClick={onClose}>Keep project</Button><Button onClick={onConfirm} className="!bg-danger-ink">Delete project</Button></div>
  </dialog>
}
