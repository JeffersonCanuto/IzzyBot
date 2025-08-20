import React, { Fragment, useState, useCallback, useEffect } from "react";
import type { Conversation as ConversationType } from "@/types";

import { FaPlus } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";

import ChatImage from "@/assets/chat-icon.svg";

interface ConversationListProps {
    conversations: ConversationType[];
    activeConversationId: string | null;
    handleSelect: (id: string) => void;
    setConversations: React.Dispatch<React.SetStateAction<ConversationType[]>>;
    setActiveConversationId: React.Dispatch<React.SetStateAction<string | null>>;
}

const ConversationList:React.FC<ConversationListProps> = ({ 
    conversations,
    activeConversationId,
    handleSelect,
    setConversations,
    setActiveConversationId
}) => {
    const [ editingId, setEditingId ] = useState<string | null>(null);
    const [ labels, setLabels ] = useState<Record<string, string>>({});
    
    // Label handler fuctions for edit and change events
    const handleLabelApplyEdit = useCallback((id:string) =>
        setEditingId(id), []);
    const handleLabelFinishEdit = useCallback(() =>
        setEditingId(null), []);
    const handleLabelApplyChange = useCallback((id:string, value:string) =>
        setLabels(prevLabel => ({...prevLabel, [id]: value})), []);

    // Add new conversation to the conversation list
    const handleAddNewConversation = useCallback(() => {
        const newConversation:ConversationType = {
            id: crypto.randomUUID(),
            messages: []
        };
        setConversations(prevConversations => [...prevConversations, newConversation ]);
        setActiveConversationId(newConversation.id);
    }, [conversations]);

    // Delete existing conversation from the conversation list
    const handleDeleteConversation = useCallback((id:string) => {
        const updatedConversationList = conversations.filter(conv => conv.id !== id);
        setConversations(updatedConversationList);
        setActiveConversationId(null);
    }, [conversations]);

    // Update conversation labels with default or chosen text
    useEffect(() => {
        setLabels(prev => {
            const updated: Record<string, string> = { ...prev };
            conversations.forEach((conv, ind) => {
                if (!updated[conv.id]) {
                    updated[conv.id] = `ChatBot (${ind + 1})`;
                }
            });
            return updated;
        });
    }, [conversations]);

    return (
        <div className="w-full md:min-w-[0px] min-w-[500px] flex flex-col flex-[0_0_30%] border rounded-md bg-gray-50 p-4 overflow-y-auto h-[40vh] md:h-[550px]">
            <div className="flex justify-between border-b pb-3 mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-500">Conversations</h2>
                <button onClick={handleAddNewConversation} className="text-gray-500 mt-1">
                    <FaPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </div>
            {conversations.length === 0 ? (
                <p className="text-sm text-gray-500">No conversations yet.</p>
            ) : (
                conversations.map(conv => (
                    <Fragment key={conv.id}>
                        <div
                            onClick={() => handleSelect(conv.id)}
                            className={`mt-5 flex flex-col p-3 cursor-pointer rounded-lg transition-colors duration-150 text-left ${
                                activeConversationId === conv.id ?
                                    "bg-blue-100 font-semibold"
                                :
                                    "bg-white hover:bg-gray-100"
                            }`}
                        >
                            <div className="flex flex-row justify-between">
                                <div className="flex flex-row gap-2">
                                    <span className="w-6 h-6 rounded-full mt-2 overflow-hidden flex items-center justify-center">
                                        <img src={ChatImage} alt="Chat Icon" className="w-full h-full object-cover" />
                                    </span>
                                    <div className={`flex flex-col ${conv.messages?.length > 0 ? "mt-0" : "mt-2"}`}>
                                        {editingId === conv.id ? (
                                            <input
                                                type="text"
                                                value={labels[conv.id]}
                                                onChange={e => handleLabelApplyChange(conv.id, e.target.value)}
                                                onBlur={handleLabelFinishEdit}
                                                onKeyDown={e => { if (e.key === "Enter") handleLabelFinishEdit(); }}
                                                autoFocus
                                                maxLength={14}
                                                className="ml-3 text-[14px] px-1 py-0 h-6 w-28 rounded focus:outline-none bg-transparent"
                                            />
                                        ) : (
                                            <span className="text-gray-900 text-[14px] ml-3">{labels[conv.id]}</span>
                                        )}
                                        {conv.messages?.length > 0 && (
                                            <span className="text-[11px] text-gray-400 ml-3">
                                                {conv.messages[conv.messages.length - 1].text.length > 13
                                                    ? `${conv.messages[conv.messages.length - 1].text.substring(0, 13)}...`
                                                    : conv.messages[conv.messages.length - 1].text
                                                }
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className={`flex ${conv.messages?.length > 0 ? "mt-0" : "mt-2"}`}>
                                    <button onClick={e => { e.stopPropagation(); handleLabelApplyEdit(conv.id); }}>
                                        <FaPencil className="text-[13px] ml-3 text-gray-500 hover:text-gray-700" />
                                    </button>
                                    <button onClick={e => { e.stopPropagation(); handleDeleteConversation(conv.id); }}>
                                        <MdDelete className="text-[14px] ml-3 text-gray-500 hover:text-gray-700" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <hr style={{ marginTop: "15px"}} />
                    </Fragment>
                ))
            )}
        </div>
    );
}

export default ConversationList;