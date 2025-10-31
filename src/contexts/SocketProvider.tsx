import { useEffect, useState, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketContext } from './SocketContext';

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Use environment variable for backend URL, fallback to localhost
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    
    console.log('🔌 Attempting to connect to:', backendUrl);
    
    const socketInstance = io(backendUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10, // Increased attempts
      reconnectionDelayMax: 5000,
      timeout: 20000, // 20 second connection timeout
      transports: ['websocket', 'polling'], // Prefer WebSocket, fallback to polling
      path: '/socket.io/', // Explicit path
      withCredentials: true, // Important for CORS
    });

    socketInstance.on('connect', () => {
      console.log('✅ Connected to server:', backendUrl);
      setConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server. Reason:', reason);
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('🔴 Connection error:', error.message);
      console.error('Backend URL:', backendUrl);
      console.error('Error details:', error);
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ socket, connected }), [socket, connected]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
