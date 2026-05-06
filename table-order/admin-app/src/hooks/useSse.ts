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

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastEvent(data);

          switch (data.type) {
            case 'order:created':
            case 'order:statusChanged':
            case 'order:deleted':
            case 'session:completed':
              queryClient.invalidateQueries({ queryKey: ['orders'] });
              queryClient.invalidateQueries({ queryKey: ['tables'] });
              break;
            case 'ping':
              // heartbeat, no action needed
              break;
          }
        } catch {
          // ignore parse errors
        }
      };

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
