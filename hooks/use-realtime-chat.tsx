'use client'

import { createClient } from '@/utils/supabase/client'
import { useCallback, useEffect, useState } from 'react'

export type ChatMessage = {
        id: string
        sender_id: string
        receiver_id: string | null
        conversation_id: string
        context: string
        status: 'sent' | 'delivered' | 'read'
        is_edited: boolean
        attachments: any[] | null
        created_at: string
        updated_at: string
}

type UseRealtimeChatProps = {
        conversationId: string
}

export function useRealtimeChat({ conversationId }: UseRealtimeChatProps) {
        const supabase = createClient()
        const [messages, setMessages] = useState<ChatMessage[]>([])

        useEffect(() => {
                const fetchMessages = async () => {
                        const { data, error } = await supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true })

                        if (!error && data) setMessages(data)
                }

                fetchMessages()
        }, [conversationId])

        useEffect(() => {
                const channel = supabase
                        .channel(`room:conversation:${conversationId}`)
                        .on(
                                'postgres_changes',
                                {
                                        event: 'INSERT',
                                        schema: 'public',
                                        table: 'messages',
                                        filter: `conversation_id=eq.${conversationId}`,
                                },
                                (payload) => {
                                        setMessages((prev) => [...prev, payload.new as ChatMessage])
                                }
                        )
                        .subscribe()

                return () => {
                        supabase.removeChannel(channel)
                }
        }, [conversationId])

        const sendMessage = useCallback(
                async (context: string, receiverId: string | null = null) => {
                        const {
                                data: { user },
                        } = await supabase.auth.getUser()

                        if (!user) {
                                console.error('User not authenticated')
                                return
                        }

                        const { error } = await supabase.from('messages').insert({
                                sender_id: user.id,
                                receiver_id: receiverId,
                                conversation_id: conversationId,
                                context,
                                status: 'sent',
                                is_edited: false,
                                attachments: null,
                        })

                        if (error) console.error('Send message error:', error.message)
                },
                [conversationId]
        )

        return { messages, sendMessage }
}
