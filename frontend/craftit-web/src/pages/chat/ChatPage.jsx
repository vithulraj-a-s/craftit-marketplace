import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../../services/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import ChatHeader from '../../components/chat/ChatHeader';
import ChatMessages from '../../components/chat/ChatMessages';
import ChatInput from '../../components/chat/ChatInput';
import { Loader } from '../../components/ui/Loader';

const CHAT_BASE_URL = "";
const CHAT_WS_URL = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;

const ChatPage = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [orderData, setOrderData] = useState(null);
  const currentUserRole = user?.role || '';
  const receiverId =
    currentUserRole.toUpperCase() === "CLIENT"
      ? orderData?.artist?.id
      : orderData?.client?.id;
  console.log("RECEIVER ID:", receiverId);
  
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!orderId) return;
    
    let isMounted = true;
    
    const fetchOrderDetails = async () => {
      try {
        const response = await axiosInstance.get(`/api/orders/${orderId}/`);
        if (isMounted) {
          setOrderData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch order details:', error);
      }
    };
    
    fetchOrderDetails();
    
    return () => {
      isMounted = false;
    };
  }, [orderId]);


  useEffect(() => {
    if (!orderId || !user) return;

    let isMounted = true;

    const fetchMessages = async () => {
      try {
        console.log("FETCHING MESSAGES FOR ORDER ID:",orderId);
        const response = await axios.get(`${CHAT_BASE_URL}/api/chat/messages/${orderId}/`, {
          withCredentials: true
        });
        console.log("API RESPONSE: ",response.data);
        if (isMounted) {
          let fetched = [];
          if (Array.isArray(response.data)) {
            fetched = response.data;
          } else if (response.data && Array.isArray(response.data.results)) {
            fetched = response.data.results;
          } else if (response.data && Array.isArray(response.data.messages)) {
            fetched = response.data.messages;
          } else {
            console.warn("Unexpected response format:", response.data);
          }
          setMessages(fetched);
          console.log("SETTING MESSAGES: ",messages);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    fetchMessages();

    return () => {
      isMounted = false;
    };
  }, [orderId, user]);


  useEffect(() => {
    if (!orderId || !user) return;

    const markAsRead = async () => {
      try {
        await axios.post(`${CHAT_BASE_URL}/api/chat/mark-as-read/${orderId}/`, {
          user_id: user.id
        }, {
          withCredentials: true
        });
      } catch (error) {
        console.error('Failed to mark chat as read:', error);
      }
    };

    markAsRead();
  }, [orderId, user]);


  useEffect(() => {
    if (!orderId || !user) return;

    const wsUrl = `${CHAT_WS_URL}/ws/chat/${orderId}/`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        console.log("WS EVENT:", data);

        if (data.type === "typing") {
          if (data.sender_id && data.sender_id !== user?.id) {
            setIsTyping(true);
          }
          return;
        }

        if (data.type === "stop_typing") {
          if (data.sender_id && data.sender_id !== user?.id) {
            setIsTyping(false);
          }
          return;
        }

        if (data.type === "chat_message") {
          const msg = data.data;

          setMessages((prevMessages) => {
            if (prevMessages.some(m => m._id === msg._id)) {
              return prevMessages;
            }
            return [...prevMessages, msg];
          });
        }

        if (data.type === "unread_update") {
          console.log("UNREAD EVENT:", data);
          // IMPORTANT:
          // If user is already inside this chat,
          // DO NOTHING (ignore the event)
        }

      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [orderId, user]);

  const handleSendMessage = (payload) => {
      const finalPayload = {
        ...payload,
        receiver_id: receiverId
      };

      console.log("FINAL PAYLOAD:", finalPayload);

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(finalPayload));
      } else {
        console.error('WebSocket is not connected');
      }
    };

  let otherUserName = 'Loading...';
  let otherUserRole = 'Loading...';

  if (orderData) {
    if (currentUserRole.toUpperCase() === 'CLIENT') {
      otherUserName = orderData.artist?.display_name || 'Artist';
      otherUserRole = 'Artist';
    } else if (currentUserRole.toUpperCase() === 'ARTIST') {
      otherUserName = orderData.client?.full_name || 'Client';
      otherUserRole = 'Client';
    } else {
      otherUserName = 'Participant';
      otherUserRole = 'User';
    }
  }

  if (!user || !orderData) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)] bg-gray-100">
        <Loader size={48} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-100 font-sans">
      <ChatHeader 
        orderId={orderId || 'Unknown'} 
        otherUserName={otherUserName} 
        otherUserRole={otherUserRole} 
      />
      
      <ChatMessages 
        messages={messages} 
        currentUserRole={currentUserRole}
      />
      
      <div className={`transition-all duration-300 ease-in-out bg-gray-50 overflow-hidden px-6 ${isTyping ? 'h-16 opacity-100 pb-4' : 'h-0 opacity-0 pb-0'}`}>
        <div className="max-w-4xl mx-auto w-full flex items-end h-full">
          <div className="bg-gray-200 rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center justify-center gap-1.5 shadow-sm w-fit">
            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
      
      <ChatInput 
        onSendMessage={handleSendMessage} 
      />
    </div>
  );
};

export default ChatPage;
