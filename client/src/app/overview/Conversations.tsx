import GetConversations from "../utils/GetConversations"
import { useEffect, useState } from "react";
import Conversation from "./Conversation";
import AddConversation from "./AddConversation";
import { useContext } from "react";
import { UserContext } from "../context/userContext";

interface Conversation {
    id: string;
    username1: string;
    username2: string;
}

interface Props {
    setConversation: (id: string) => void;
}

const Conversations = ({setConversation}: Props) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReload, setIsReload] = useState<boolean>(false)

    const {user} = useContext(UserContext)

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);


    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        setIsReload(false)
        const fetchConversations = async () => {
            try {
                if(user.username){
                    const data = await GetConversations(user.username);
                    setConversations(data.result);  
                    setLoading(false); 
                }
                 
            } catch (error) {
                console.log(error)
                setError('Error fetching conversatiooons');
                setLoading(false);
            }
        };

        fetchConversations();
    }, [user, isReload]); 

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return(
        <div className="flex flex-col justify-start w-1/3 h-full bg-gray-800 pt-2 pb-20 ps-5 pe-5 rounded-lg">
            <div className="flex justify-between items-center">
                <h1>Conversations</h1>
                <button className="btn btn-primary" onClick={()=>openModal()}>Add</button>
            </div>
            <div className="mt-5 m-b5 flex flex-col gap-2">
                {conversations &&
                conversations.map(conv => (
                    <Conversation key={conv.id} setIsReload={setIsReload} conversation={conv} setConversation={setConversation} username={user.username}/>
                ))
                }
            </div>
            <AddConversation isOpen={isModalOpen} setIsReload={setIsReload} onClose={closeModal} username={user.username} />
        </div>
    )
}

export default Conversations