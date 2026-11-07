import { useEffect, useRef, useState } from 'react'

import { supabase } from '@/lib/supabase/client'

export type RealtimeState = 'connecting' | 'connected' | 'reconnecting'

export interface RealtimeTarget {
  table: string
  filter?: string
}

export function useRealtimeSubscription({
  enabled,
  name,
  targets,
  onChange,
}: {
  enabled: boolean
  name: string
  targets: RealtimeTarget[]
  onChange: () => void | Promise<void>
}) {
  const [state, setState] = useState<RealtimeState>('connecting')
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!enabled || targets.length === 0) {
      return
    }

    let stopped = false
    let refreshTimer: number | undefined
    let reconnectTimer: number | undefined
    let channel = supabase.channel(`${name}:${crypto.randomUUID()}`)

    const scheduleRefresh = () => {
      window.clearTimeout(refreshTimer)
      refreshTimer = window.setTimeout(() => {
        if (!stopped) void onChangeRef.current()
      }, 250)
    }

    const connect = () => {
      for (const target of targets) {
        channel = channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: target.table,
            ...(target.filter ? { filter: target.filter } : {}),
          },
          scheduleRefresh,
        )
      }

      channel.subscribe((status) => {
        if (stopped) return
        const statusName = String(status)
        if (statusName === 'SUBSCRIBED') {
          setState('connected')
          return
        }
        if (statusName !== 'CHANNEL_ERROR' && statusName !== 'TIMED_OUT') return

        setState('reconnecting')
        window.clearTimeout(reconnectTimer)
        reconnectTimer = window.setTimeout(() => {
          if (stopped) return
          void supabase.removeChannel(channel)
          channel = supabase.channel(`${name}:${crypto.randomUUID()}`)
          connect()
        }, 2500)
      })
    }

    connect()

    return () => {
      stopped = true
      window.clearTimeout(refreshTimer)
      window.clearTimeout(reconnectTimer)
      void supabase.removeChannel(channel)
    }
  }, [enabled, name, targets])

  return state
}
