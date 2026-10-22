import { useEffect, useRef, useState } from 'react'
import { fileNameForMimeType, pickMimeType } from '../lib/audio'
import { UserFacingError } from '../lib/errors'

export interface Recording {
  blob: Blob
  fileName: string
}

interface ActiveRecording {
  recorder: MediaRecorder
  stream: MediaStream
  chunks: Blob[]
  timerId: number
}

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const activeRef = useRef<ActiveRecording | null>(null)

  function release() {
    const active = activeRef.current
    if (!active) return
    window.clearInterval(active.timerId)
    // Stopping the tracks turns off the browser's microphone indicator.
    active.stream.getTracks().forEach((track) => track.stop())
    activeRef.current = null
    setIsRecording(false)
  }

  useEffect(() => release, [])

  async function start(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      throw new UserFacingError('Ta przeglądarka nie obsługuje nagrywania dźwięku.')
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mimeType = pickMimeType((type) => MediaRecorder.isTypeSupported(type))
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    const chunks: Blob[] = []
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }

    const startedAt = Date.now()
    const timerId = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000))
    }, 250)

    activeRef.current = { recorder, stream, chunks, timerId }
    setElapsedSeconds(0)
    setIsRecording(true)
    recorder.start()
  }

  function stop(): Promise<Recording> {
    const active = activeRef.current
    if (!active) return Promise.reject(new UserFacingError('Nagrywanie nie jest aktywne.'))

    return new Promise((resolve, reject) => {
      active.recorder.onstop = () => {
        // The actual type may differ from the requested one; it decides the file extension.
        const type = active.recorder.mimeType || active.chunks[0]?.type || ''
        const blob = new Blob(active.chunks, { type })
        release()
        if (blob.size === 0) {
          reject(new UserFacingError('Nagranie jest puste. Spróbuj nagrać notatkę jeszcze raz.'))
          return
        }
        resolve({ blob, fileName: fileNameForMimeType(type) })
      }
      active.recorder.stop()
    })
  }

  return { isRecording, elapsedSeconds, start, stop }
}
