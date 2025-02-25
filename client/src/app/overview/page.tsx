'use client'

import TopData from "./TopData";
import Chat from "./Chat"
import Input from "./Input";
import Conversations from "./Conversations";

import { io, Socket } from "socket.io-client";
import { useState, useEffect, useRef } from "react";

import { useContext } from "react";
import { UserContext } from "../context/userContext";

const ChatContainer = () => {
    const [messages, setMessages] = useState<{ msg: string; username: string; created_at: string }[]>([]);
    const [conversationId, setConversationId] = useState<string>('');
    const socketRef = useRef<Socket | null>(null);

    const { user, selected, isMobile, setIsMobile, keyBoard } = useContext(UserContext);


    // Detectar si es móvil y actualizar el estado
    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkIsMobile();
        window.addEventListener("resize", checkIsMobile);

        return () => {
            window.removeEventListener("resize", checkIsMobile);
        };
    }, [setIsMobile]);

    // Manejo de la conexión del socket  
    useEffect(() => {
        if (conversationId) {
            setMessages([]);
            socketRef.current = io("https://livechat-server-production-6654.up.railway.app", {
                auth: { username: user },
            });

            const socket = socketRef.current;

            socket.emit("join_conversation", conversationId);

            socket.emit("fetch_messages", { conversationId });

            socket.on("chat_message", ({ msg, username, created_at }) => {
                setMessages((prevMessages) => [...prevMessages, { msg, username, created_at }]);
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [conversationId, user]);

    const sendMessage = (message: string) => {
        if (conversationId) {
            const messageData = { conversationId, msg: message, username: user.username || "Anonymous" };
            socketRef.current?.emit("chat_message", messageData);
        }
    };

    return (
        <section className={`${keyBoard ? 'h-custom-chat' : ''} overflow-hidden`}>
            {user ?
                <>
                    {isMobile ?
                        <div className="h-full flex flex-wrap justify-center items-start gap-0">
                            {selected ?
                                <div
                                    className={`w-full flex flex-col relative ${keyBoard ? 'h-custom-chat' : 'h-svh'}`}
                                >
                                    <TopData user={selected} />
                                    <Chat messages={messages} conversation={conversationId} />
                                    <Input onSendMessage={sendMessage} />
                                </div>
                                :
                                <Conversations setConversation={setConversationId} />
                            }
                        </div>
                        :
                        <div className="h-full flex flex-wrap lg:flex-nowrap justify-center items-start">
                            <Conversations setConversation={setConversationId} />
                            <div className="w-full h-screen flex flex-col relative">
                                {selected ?
                                    <>
                                        <TopData user={selected} />
                                        <Chat messages={messages} conversation={conversationId} />                       
                                        <Input onSendMessage={sendMessage} />
                                    </>
                                    :
                                    <div className="flex h-full w-full justify-center items-center">
                                        <h1 className="text-3xl">Select a chat to talk</h1>
                                    </div>
                                }
                            </div>
                        </div>
                    }
                </>
                :
                <div className="flex justify-center items-center p-20 m-20">
                    <h1 className="text-3xl font-bold">Login Required</h1>
                </div>
            }
        </section>
    );
};

export default ChatContainer;
