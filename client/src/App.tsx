import React from 'react';
import ChatPage from '@/pages/ChatPage';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const App:React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <ChatPage />
        </QueryClientProvider>
    );
}

export default App;