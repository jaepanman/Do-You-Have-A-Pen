import { RoomState, SupplyId } from '../types';

export async function createRoom(playerName: string): Promise<{
  roomId: string;
  playerId: string;
  role: 'player1';
  room: RoomState;
}> {
  const res = await fetch('/api/rooms/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create room');
  }
  return res.json();
}

export async function joinRoom(
  roomId: string,
  playerName: string,
  playerId?: string
): Promise<{
  roomId: string;
  playerId: string;
  role: 'player2' | 'player1';
  room: RoomState;
}> {
  const res = await fetch('/api/rooms/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, playerName, playerId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to join room');
  }
  return res.json();
}

export async function getRoom(roomId: string): Promise<RoomState> {
  const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to get room state');
  }
  const data = await res.json();
  return data.room;
}

export async function sendRoomAction(
  roomId: string,
  role: 'player1' | 'player2',
  action: string,
  payload: Record<string, any>
): Promise<RoomState> {
  const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, action, payload }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Action failed');
  }
  const data = await res.json();
  return data.room;
}

// Real-time synchronization with WebSocket + automatic polling fallback
export function subscribeToRoom(
  roomId: string,
  onUpdate: (room: RoomState) => void
): () => void {
  let isSubscribed = true;
  let ws: WebSocket | null = null;
  let pollInterval: ReturnType<typeof setInterval> | null = null;

  function connectWs() {
    if (!isSubscribed) return;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'subscribe', roomId }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'room_state' && data.room) {
            onUpdate(data.room);
          }
        } catch (e) {
          // Ignore
        }
      };

      ws.onerror = () => {
        // Fallback polling will handle updates
      };

      ws.onclose = () => {
        // Retry connection in 3 seconds if still mounted
        if (isSubscribed) {
          setTimeout(connectWs, 3000);
        }
      };
    } catch (e) {
      // WS not supported, fallback polling will take over
    }
  }

  // Initial fetch
  getRoom(roomId)
    .then((r) => {
      if (isSubscribed) onUpdate(r);
    })
    .catch(() => {});

  connectWs();

  // Background polling every 2.5 seconds to guarantee syncing across network drops/firewalls
  pollInterval = setInterval(() => {
    if (!isSubscribed) return;
    getRoom(roomId)
      .then((r) => {
        if (isSubscribed) onUpdate(r);
      })
      .catch(() => {});
  }, 2500);

  return () => {
    isSubscribed = false;
    if (pollInterval) clearInterval(pollInterval);
    if (ws) {
      try {
        ws.close();
      } catch (e) {
        // ignore
      }
    }
  };
}
