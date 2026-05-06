import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useSseStore } from '../stores/sseStore';

export function useSse() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const { setConnected, setLastEvent } = useSseStore();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!token) return;

    function connect() {
      const eventSource = new EventSource(`/api/sse/orders?token=${token}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setConnected(true);
      };

      const handleEvent = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          setLastEvent(data);
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['tables'] });
        } catch {
          // ignore parse errors
        }
      };

      eventSource.addEventListener('order:created', handleEvent);
      eventSource.addEventListener('order:statusChanged', handleEvent);
      eventSource.addEventListener('order:deleted', handleEvent);
      eventSource.addEventListener('session:completed', handleEvent);

      eventSource.onerror = () => {
        setConnected(false);
        eventSource.close();
        eventSourceRef.current = null;

        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };
    }

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      setConnected(false);
    };
  }, [token, queryClient, setConnected, setLastEvent]);
}
