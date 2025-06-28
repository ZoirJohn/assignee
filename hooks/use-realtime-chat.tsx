'use client'
import { createClient } from '@/utils/supabase/client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type UseRealtimeChatProps = {
        roomName: string
        username: string
}

export type ChatMessage = {
        id: string
        content: string
        user: {
                name: string
        }
        createdAt: string
}

const EVENT_MESSAGE_TYPE = 'message'

export function useRealtimeChat({ roomName, username }: UseRealtimeChatProps) {
        const supabase = useMemo(() => createClient(), [])
        const [messages, setMessages] = useState<ChatMessage[]>([])
        const [channel, setChannel] = useState<ReturnType<typeof supabase.channel> | null>(null)
        const [isConnected, setIsConnected] = useState(false)
        const initialized = useRef(false)

        useEffect(() => {
                if (initialized.current) return
                initialized.current = true
                console.log(initialized)
                const newChannel = supabase.channel(roomName, {
                        config: {
                                broadcast: {
                                        self: true,
                                },
                        },
                })
                newChannel
                        .on('broadcast', { event: EVENT_MESSAGE_TYPE }, (payload) => {
                                setMessages((current) => [...current, payload.payload as ChatMessage])
                        })
                        .subscribe(async (status) => {
                                if (status === 'SUBSCRIBED') {
                                        setIsConnected(true)
                                }
                        })

                setChannel(newChannel)

                return () => {
                        supabase.removeChannel(newChannel)
                }
        }, [roomName, username, supabase])

        const sendMessage = useCallback(
                async (content: string) => {
                        if (!channel || !isConnected) return

                        const message: ChatMessage = {
                                id: crypto.randomUUID(),
                                content,
                                user: {
                                        name: username,
                                },
                                createdAt: new Date().toISOString(),
                        }

                        setMessages((current) => [...current, message])

                        await channel.send({
                                type: 'broadcast',
                                event: EVENT_MESSAGE_TYPE,
                                payload: message,
                        })
                },
                [channel, isConnected, username]
        )

        return { messages, sendMessage, isConnected }
}
