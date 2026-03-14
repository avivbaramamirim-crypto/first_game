/**
 * Real-time Multiplayer System
 * Supports WebSocket connections for real-time gameplay
 */

class RealtimeMultiplayer {
    constructor() {
        this.ws = null;
        this.roomId = null;
        this.playerId = null;
        this.isHost = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.heartbeatInterval = null;
        this.messageQueue = [];
        this.latency = 0;
        this.lastPingTime = 0;
        
        // Event callbacks
        this.onConnect = null;
        this.onDisconnect = null;
        this.onMessage = null;
        this.onError = null;
        this.onPlayerJoin = null;
        this.onPlayerLeave = null;
        this.onGameUpdate = null;
    }

    // Initialize WebSocket connection
    connect(serverUrl = 'ws://localhost:8080') {
        try {
            this.ws = new WebSocket(serverUrl);
            this.setupEventHandlers();
            
            // Connection timeout
            setTimeout(() => {
                if (this.ws.readyState === WebSocket.CONNECTING) {
                    this.ws.close();
                    this.handleError('Connection timeout');
                }
            }, 10000);
            
        } catch (error) {
            this.handleError('Failed to create WebSocket connection');
            console.error('WebSocket connection error:', error);
        }
    }

    // Setup WebSocket event handlers
    setupEventHandlers() {
        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
            this.startHeartbeat();
            this.flushMessageQueue();
            
            if (this.onConnect) {
                this.onConnect({
                    playerId: this.playerId,
                    roomId: this.roomId,
                    isHost: this.isHost
                });
            }
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                console.error('Failed to parse message:', error);
                this.handleError('Invalid message format');
            }
        };

        this.ws.onclose = (event) => {
            console.log('WebSocket disconnected:', event.code, event.reason);
            this.stopHeartbeat();
            
            if (this.onDisconnect) {
                this.onDisconnect({
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean
                });
            }

            // Auto-reconnect logic
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                setTimeout(() => {
                    this.reconnectAttempts++;
                    console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
                    this.connect();
                }, 2000 * Math.pow(2, this.reconnectAttempts));
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.handleError('WebSocket connection error');
        };
    }

    // Handle incoming messages
    handleMessage(data) {
        switch (data.type) {
            case 'ping':
                this.handlePing(data.timestamp);
                break;
                
            case 'pong':
                this.handlePong(data.timestamp);
                break;
                
            case 'joinRoom':
                this.handleJoinRoom(data);
                break;
                
            case 'leaveRoom':
                this.handleLeaveRoom(data);
                break;
                
            case 'gameUpdate':
                this.handleGameUpdate(data);
                break;
                
            case 'playerJoined':
                this.handlePlayerJoined(data);
                break;
                
            case 'playerLeft':
                this.handlePlayerLeft(data);
                break;
                
            case 'error':
                this.handleError(data.message);
                break;
                
            default:
                console.warn('Unknown message type:', data.type);
        }
    }

    // Handle room joining
    joinRoom(roomId, playerName = 'Player') {
        this.roomId = roomId;
        this.playerId = this.generatePlayerId();
        
        this.sendMessage({
            type: 'joinRoom',
            roomId: roomId,
            playerName: playerName,
            playerId: this.playerId
        });
    }

    // Handle room creation
    createRoom(gameType, maxPlayers = 2) {
        this.roomId = this.generateRoomId();
        this.playerId = this.generatePlayerId();
        this.isHost = true;
        
        this.sendMessage({
            type: 'createRoom',
            roomId: this.roomId,
            gameType: gameType,
            maxPlayers: maxPlayers,
            hostId: this.playerId,
            hostName: 'Host'
        });
    }

    // Send game update
    sendGameUpdate(gameState) {
        this.sendMessage({
            type: 'gameUpdate',
            roomId: this.roomId,
            playerId: this.playerId,
            gameState: gameState,
            timestamp: Date.now()
        });
    }

    // Handle specific message types
    handleJoinRoom(data) {
        if (data.success) {
            console.log('Successfully joined room:', data.roomId);
        } else {
            this.handleError(data.message || 'Failed to join room');
        }
    }

    handleLeaveRoom(data) {
        console.log('Left room:', data.roomId);
        this.roomId = null;
        this.isHost = false;
    }

    handleGameUpdate(data) {
        if (this.onGameUpdate) {
            this.onGameUpdate({
                playerId: data.playerId,
                gameState: data.gameState,
                timestamp: data.timestamp
            });
        }
    }

    handlePlayerJoined(data) {
        console.log('Player joined:', data.playerName);
        if (this.onPlayerJoin) {
            this.onPlayerJoin(data);
        }
    }

    handlePlayerLeft(data) {
        console.log('Player left:', data.playerName);
        if (this.onPlayerLeave) {
            this.onPlayerLeave(data);
        }
    }

    // Heartbeat system for connection health
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            this.sendPing();
        }, 30000); // Ping every 30 seconds
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    sendPing() {
        this.lastPingTime = Date.now();
        this.sendMessage({
            type: 'ping',
            timestamp: this.lastPingTime
        });
    }

    handlePing(timestamp) {
        this.sendMessage({
            type: 'pong',
            timestamp: timestamp
        });
    }

    handlePong(timestamp) {
        if (this.lastPingTime) {
            this.latency = Date.now() - this.lastPingTime;
            console.log('Latency:', this.latency, 'ms');
        }
    }

    // Error handling
    handleError(message) {
        console.error('Multiplayer error:', message);
        if (this.onError) {
            this.onError(message);
        }
    }

    // Send message with queueing for disconnected state
    sendMessage(message) {
        const messageWithTimestamp = {
            ...message,
            timestamp: Date.now()
        };

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(messageWithTimestamp));
        } else {
            // Queue message for when connection is restored
            this.messageQueue.push(messageWithTimestamp);
        }
    }

    // Flush queued messages
    flushMessageQueue() {
        while (this.messageQueue.length > 0 && this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message = this.messageQueue.shift();
            this.ws.send(JSON.stringify(message));
        }
    }

    // Utility functions
    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }

    generateRoomId() {
        return 'room_' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    // Get connection status
    getConnectionStatus() {
        if (!this.ws) return 'disconnected';
        
        switch (this.ws.readyState) {
            case WebSocket.CONNECTING: return 'connecting';
            case WebSocket.OPEN: return 'connected';
            case WebSocket.CLOSING: return 'disconnecting';
            case WebSocket.CLOSED: return 'disconnected';
            default: return 'unknown';
        }
    }

    // Get performance metrics
    getMetrics() {
        return {
            latency: this.latency,
            reconnectAttempts: this.reconnectAttempts,
            queuedMessages: this.messageQueue.length,
            connectionStatus: this.getConnectionStatus(),
            roomId: this.roomId,
            playerId: this.playerId,
            isHost: this.isHost
        };
    }

    // Disconnect
    disconnect() {
        this.stopHeartbeat();
        
        if (this.ws) {
            this.ws.close(1000, 'User initiated disconnect');
        }
        
        this.ws = null;
        this.roomId = null;
        this.isHost = false;
        this.messageQueue = [];
    }
}

// Export for global use
window.RealtimeMultiplayer = RealtimeMultiplayer;
