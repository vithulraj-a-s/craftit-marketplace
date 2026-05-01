import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../../services/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import ChatHeader from '../../components/chat/ChatHeader';
import ChatMessages from '../../components/chat/ChatMessages';
import ChatInput from '../../components/chat/ChatInput';

const CHAT_BASE_URL = "http://localhost:8001";
const CHAT_WS_URL = "ws://localhost:8001";

const ChatPage = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const currentUserRole = user?.role || '';
  
  const [orderData, setOrderData] = useState(null);
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);

  // A) Fetch Order Details
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

  // B) Fetch Chat History
  useEffect(() => {
    if (!orderId) return;

    let isMounted = true;

    const fetchMessages = async () => {
      try {
        console.log("FETCHING MESSAGES FOR ORDER ID:",orderId);
        const response = await axios.get(`${CHAT_BASE_URL}/chat/messages/${orderId}/`, {
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
  }, [orderId]);

  // C) WebSocket Connection
  useEffect(() => {
    if (!orderId) return;

    const wsUrl = `${CHAT_WS_URL}/ws/chat/${orderId}/`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Unwrap message if backend encapsulates it
        const msgToAppend = data.message && typeof data.message === 'object' && data.message.sender_role ? data.message : data;

        setMessages((prevMessages) => {
          // Prevent duplicates using _id or id
          const msgId = msgToAppend._id || msgToAppend.id;
          if (msgId && prevMessages.some(m => (m._id === msgId || m.id === msgId))) {
            return prevMessages;
          }
          return [...prevMessages, msgToAppend];
        });
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
  }, [orderId]);

  const handleSendMessage = (content) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        message: content
      }));
    } else {
      console.error('WebSocket is not connected');
    }
  };

  // Determine chat header details dynamically
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

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <ChatHeader 
        orderId={orderId || 'Unknown'} 
        otherUserName={otherUserName} 
        otherUserRole={otherUserRole} 
      />
      
      <ChatMessages 
        messages={messages} 
        currentUserRole={currentUserRole}
      />
      
      <ChatInput 
        onSendMessage={handleSendMessage} 
      />
    </div>
  );
};

export default ChatPage;
