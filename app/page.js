'use client'

import { Box, Button, Stack, TextField, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image';


export default function Home() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hello! I'm UniGuide, here to assist you with all your university-related questions and provide guidance. What can I help you with today?",
        },
    ])
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [language, setLanguage] = useState('en')

    const sendMessage = async () => {
        if (!message.trim() || isLoading) return;
        setIsLoading(true)
        const userMessage = { role: 'user', content: message };
        setMessages((prevMessages) => [
            ...prevMessages,
            userMessage,
            { role: 'assistant', content: '' },
        ])

        setMessage('')

        try {
            console.log('Sending message to API...')
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages: [userMessage] }),
            })

            console.log('Response received:', response.status, response.statusText)
            console.log('Response headers:', response.headers)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            // Get the response text
            const responseText = await response.text()
            console.log('Response text:', responseText)

            if (responseText.trim()) {
                setMessages((prevMessages) => {
                    const lastMessage = prevMessages[prevMessages.length - 1]
                    const otherMessages = prevMessages.slice(0, prevMessages.length - 1)
                    return [
                        ...otherMessages,
                        { ...lastMessage, content: responseText },
                    ]
                })
            }
        } catch (error) {
            console.error('Error:', error)
            setMessages((prevMessages) => {
                const lastMessage = prevMessages[prevMessages.length - 1]
                const otherMessages = prevMessages.slice(0, prevMessages.length - 1)
                return [
                    ...otherMessages,
                    { 
                        role: 'assistant', 
                        content: `I'm sorry, but I encountered an error: ${error.message}. Please try again later.` 
                    },
                ]
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            sendMessage()
        }
    }

    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    return (
        <Box
            width="100vw"
            height="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{ backgroundColor: '#75033e' }}
        >
            <Stack 
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ marginBottom: '10px'}}
            > 
            <Box sx={{ display:'flex', alignItems: 'center'}}>
            <Image 
            src=  "/icons/titleicon.png"
            alt="Logo"
            width={200}
            height = {100}
            style={{ marginTop: '40px' }}
            />
            </Box>
            <Typography 
                variant="h3"
                component="h1"
                color="#FFFFFF"
                gutterBottom
            sx= {{ marginBottom: '20px', marginTop: '40px', fontWeight: 'bold'}}
            >
                Welcome to UniGuide!
            </Typography>
            </Stack>
            <Stack
                direction={'column'}
                width="1400px"
                height="700px"
                border="6px solid #a1a1a0"
                p={2}
                spacing={3}
                sx={{ backgroundColor: '#FFFFFF' }} 
               
            >
                <Stack
                    direction={'column'}
                    spacing={2}
                    flexGrow={1}
                    overflow="auto"
                    maxHeight="100%"
                >
                    {messages.map((message, index) => (
                        <Box
                            key={index}
                            display="flex"
                            justifyContent={
                                message.role === 'assistant' ? 'flex-start' : 'flex-end'
                            }
                        >
                            {message.role === 'assistant' && (
                                <Image
                                    src="/icons/icon4.png"  // Path to your custom icon
                                    alt="Chatbot Icon"
                                        width={35}
                                        height={35}
                                        style={{ marginRight: '8px' }}
                                />
                            )}
                            <Box
                                bgcolor={
                                    message.role === 'assistant'
                                        ? '#a1a1a0'
                                        : '#75033e'
                                }
                                color="white"
                                borderRadius={16}
                                p={3}
                            >
                                {message.content}
                            </Box>
                        </Box>
                    ))}
                    <div ref={messagesEndRef} />
                </Stack>
                <Stack direction={'row'} spacing={2}>
                <FormControl>
                        <InputLabel id="language-label">Language</InputLabel>
                        <Select
                            labelId="language-label"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            label="Language"
                        >
                            <MenuItem value="en">English</MenuItem>
                            <MenuItem value="ar">Arabic</MenuItem>
                            <MenuItem value="fr">French</MenuItem>
                            <MenuItem value="es">Spanish</MenuItem>
                            <MenuItem value="zh">Chinese</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Message UniGuide"
                        fullWidth
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />
                    <Button 
                        variant="contained" 
                        onClick={sendMessage}
                        disabled={isLoading}
                        sx= {{backgroundColor: '#75033e' , color: '#fff'}}
                    >
                        {isLoading ? 'Sending...' : 'Send'}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    )
}
