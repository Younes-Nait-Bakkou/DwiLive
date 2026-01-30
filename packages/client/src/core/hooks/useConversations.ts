import { useState, useEffect } from "react";
import type { ConversationDTO } from "@dwilive/shared";
import { MOCK_CONVERSATIONS } from "../mocks";

export const useConversations = () => {
  const [data, setData] = useState<ConversationDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API network delay
    const timer = setTimeout(() => {
      setData(MOCK_CONVERSATIONS);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return { conversations: data, isLoading };
};
