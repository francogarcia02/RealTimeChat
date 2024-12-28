'use client'

import Chat from "./Chat"
import Input from "./Input";
import Conversations from "./Conversations";
import Header from "../components/header/page"
import { io, Socket } from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import AuthStatus from "@/app/utils/AuthStatus";

const ChatContainer = () => {
    const [messages, setMessages] = useState<{ msg: string; username: string }[]>([]);
    const [ , setServerOffset] = useState<number>(0);
    const socketRef = useRef<Socket | null>(null);
    
    

    const data = AuthStatus();
    const user = data?.user?.username;

  
    useEffect(() => {
      socketRef.current = io("http://localhost:4000", {
        auth: { username: user },
      });
  
      const socket = socketRef.current;
  
      socket.on("chat message", (msg: string, offset: number, username: string) => {
        setMessages((prevMessages) => [...prevMessages, { msg, username }]);
        setServerOffset(offset);
      });
  
      return () => {
        socket.disconnect();
      };
    }, [user]);
  
    const sendMessage = (message: string) => {
      const messageData = { msg: message, username: user || "Anonymous" };
      socketRef.current?.emit("chat message", messageData);
    };
  

    return (
        <section>
            <Header/>
            {user ? 
                <div className="h-full flex flex-wrap justify-center items-start m-1 gap-1">
                    <Conversations/>
                    <div className="sm:w-full lg:w-1/3  h-[250px] lg:h-[540px] flex flex-col border border-gray-300 rounded-lg relative">
                        <Chat messages={messages} currentUser={user} />
                        <Input onSendMessage={sendMessage} />
                    </div>
                </div>
            :
                <div className="flex justify-center items-center p-20 m-20">
                    <h1 className="text-3xl font-bold">Login Required</h1>
                </div>
            }
        </section>
    )
}

export default ChatContainer