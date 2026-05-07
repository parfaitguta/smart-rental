import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { getConversations, getChat, sendMessage } from '../api/messageApi'
import Spinner from '../components/common/Spinner'
import toast from 'react-hot-toast'
import { Send, MessageSquare, User, Home, Phone, Mail, CheckCheck, Check, Users, ArrowLeft } from 'lucide-react'
import { formatDate } from '../utils/helpers'

export default function Messages() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [activeUserId, setActiveUserId] = useState(null)
  const [activeUser, setActiveUser] = useState(null)
  const [activeProperty, setActiveProperty] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  // Check if coming from "Start Chat" button
  useEffect(() => {
    if (location.state?.startChat) {
      const { userId, userName, propertyTitle } = location.state
      setActiveUserId(userId)
      setActiveUser({ 
        id: userId, 
        name: userName, 
        role: 'tenant',
        phone: '',
        email: ''
      })
      setActiveProperty({ id: null, title: propertyTitle })
      // Clear the state so it doesn't reopen on refresh
      navigate('/messages', { replace: true })
    }
  }, [location.state, navigate])

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (activeUserId) {
      fetchChat(activeUserId)
    }
  }, [activeUserId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const res = await getConversations()
      setConversations(res.data.conversations || [])
    } catch (err) {
      console.error('Failed to load conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchChat = async (userId) => {
    try {
      const res = await getChat(userId)
      setMessages(res.data.messages || [])
    } catch (err) {
      toast.error('Failed to load messages')
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    
    setSending(true)
    try {
      await sendMessage({ 
        receiver_id: activeUserId, 
        message: newMessage,
        property_id: activeProperty?.id || null
      })
      setNewMessage('')
      fetchChat(activeUserId)
      fetchConversations()
    } catch (err) {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const openConversation = (conv) => {
    const otherId = conv.sender_id === user.id ? conv.receiver_id : conv.sender_id
    const otherName = conv.sender_id === user.id ? conv.receiver_name : conv.sender_name
    const otherRole = conv.sender_id === user.id ? conv.receiver_role : conv.sender_role
    const otherPhone = conv.sender_id === user.id ? conv.receiver_phone : conv.sender_phone
    const otherEmail = conv.sender_id === user.id ? conv.receiver_email : conv.sender_email
    
    setActiveUserId(otherId)
    setActiveUser({ 
      id: otherId, 
      name: otherName, 
      role: otherRole,
      phone: otherPhone,
      email: otherEmail
    })
    setActiveProperty({ 
      id: conv.property_id, 
      title: conv.property_title 
    })
  }

  if (loading) return <Spinner size="lg" />

  const isLandlord = user?.role === 'landlord'

  return (
    <div className="h-[calc(100vh-120px)] flex rounded-xl overflow-hidden shadow-lg">
      {/* Conversations List */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="font-bold text-white flex items-center gap-2">
            <MessageSquare size={18} /> Messages
          </h2>
          <p className="text-blue-100 text-xs mt-1">
            {isLandlord ? 'Chat with your tenants' : 'Chat with your landlord'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <Users size={48} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No conversations yet</p>
              <p className="text-gray-300 text-xs mt-1">
                {isLandlord 
                  ? 'Go to My Tenants and click "Message Tenant" to start'
                  : 'Go to My Rentals and click "Message Landlord" to start'}
              </p>
            </div>
          ) : (
            conversations.map((conv, i) => {
              const otherId = conv.sender_id === user.id ? conv.receiver_id : conv.sender_id
              const otherName = conv.sender_id === user.id ? conv.receiver_name : conv.sender_name
              const otherRole = conv.sender_id === user.id ? conv.receiver_role : conv.sender_role
              const unreadCount = conv.unread_count || 0
              
              return (
                <button
                  key={i}
                  onClick={() => openConversation(conv)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b transition-all ${
                    activeUserId === otherId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      otherRole === 'landlord' ? 'bg-purple-100' : 'bg-green-100'
                    }`}>
                      <User size={18} className={otherRole === 'landlord' ? 'text-purple-600' : 'text-green-600'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-gray-800 text-sm truncate">{otherName}</p>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 capitalize">{otherRole}</p>
                      {conv.property_title && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Home size={10} className="text-gray-400" />
                          <p className="text-xs text-gray-400 truncate">{conv.property_title}</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {conv.message?.length > 50 ? conv.message.substring(0, 50) + '...' : conv.message}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {formatDate(conv.created_at)}
                  </p>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {!activeUserId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-400">Select a conversation to start chatting</p>
              <p className="text-gray-300 text-sm mt-1">
                {isLandlord 
                  ? 'Go to My Tenants → Click "Message Tenant" to start a chat'
                  : 'Go to My Rentals → Click "Message Landlord" to start a chat'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b px-5 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    setActiveUserId(null)
                    setActiveUser(null)
                    setActiveProperty(null)
                  }}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activeUser?.role === 'landlord' ? 'bg-purple-100' : 'bg-green-100'
                }`}>
                  <User size={18} className={activeUser?.role === 'landlord' ? 'text-purple-600' : 'text-green-600'} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{activeUser?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{activeUser?.role}</p>
                  {activeProperty?.title && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Home size={10} className="text-gray-400" />
                      <p className="text-xs text-gray-500">{activeProperty.title}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 text-xs text-gray-400">
                {activeUser?.phone && (
                  <div className="flex items-center gap-1">
                    <Phone size={12} />
                    <span>{activeUser.phone}</span>
                  </div>
                )}
                {activeUser?.email && (
                  <div className="flex items-center gap-1">
                    <Mail size={12} />
                    <span>{activeUser.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-8">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No messages yet</p>
                  <p className="text-xs mt-1">Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isOwn = msg.sender_id === user.id
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] lg:max-w-[60%] ${isOwn ? 'items-end' : 'items-start'}`}>
                        {!isOwn && (
                          <p className="text-xs text-gray-500 mb-1 ml-2">
                            {msg.sender_name}
                          </p>
                        )}
                        <div
                          className={`px-4 py-2 rounded-2xl text-sm ${
                            isOwn
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-white text-gray-800 shadow-sm rounded-bl-none border'
                          }`}
                        >
                          {msg.property_title && !isOwn && (
                            <p className="text-xs mb-1 text-blue-500">
                              Regarding: {msg.property_title}
                            </p>
                          )}
                          <p className="break-words">{msg.message}</p>
                          <div className={`flex items-center gap-1 mt-1 text-xs ${
                            isOwn ? 'text-blue-200' : 'text-gray-400'
                          }`}>
                            <span>{formatDate(msg.created_at)}</span>
                            {isOwn && (
                              msg.is_read ? (
                                <CheckCheck size={12} className="text-blue-300" />
                              ) : (
                                <Check size={12} />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSend} className="bg-white border-t px-4 py-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder={`Message ${activeUser?.name}...`}
                  className="flex-1 border border-gray-300 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full disabled:opacity-50 transition-colors shadow-md"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}