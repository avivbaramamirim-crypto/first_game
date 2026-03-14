/**
 * Load Testing System for Multiplayer Games
 * Simulates high-volume scenarios and stress testing
 */

class LoadTestingSystem {
    constructor() {
        this.testResults = [];
        this.activeConnections = [];
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            peakConcurrentUsers: 0,
            errors: []
        };
        this.testScenarios = [];
        this.isRunning = false;
    }

    // Initialize test scenarios
    initTestScenarios() {
        this.testScenarios = [
            {
                name: 'Basic Connection Test',
                type: 'connection',
                parameters: {
                    concurrentUsers: 10,
                    rampUpTime: 5000, // 5 seconds
                    testDuration: 30000 // 30 seconds
                }
            },
            {
                name: 'Rapid Room Creation',
                type: 'roomCreation',
                parameters: {
                    roomsPerSecond: 5,
                    totalRooms: 50,
                    usersPerRoom: 2
                }
            },
            {
                name: 'Game State Updates',
                type: 'gameUpdates',
                parameters: {
                    updatesPerSecond: 20,
                    totalUpdates: 1000,
                    concurrentGames: 25
                }
            },
            {
                name: 'Player Join/Leave Stress',
                type: 'playerChurn',
                parameters: {
                    joinRate: 2, // players per second
                    leaveRate: 1.5, // players per second
                    testDuration: 60000, // 1 minute
                    maxConcurrentPlayers: 100
                }
            },
            {
                name: 'Message Flood Test',
                type: 'messageFlood',
                parameters: {
                    messagesPerSecond: 50,
                    messageSize: 1024, // bytes
                    testDuration: 30000,
                    concurrentConnections: 20
                }
            },
            {
                name: 'Network Interruption Test',
                type: 'networkResilience',
                parameters: {
                    disconnectionRate: 0.1, // 10% chance per second
                    reconnectionDelay: 2000, // 2 seconds
                    testDuration: 45000
                }
            },
            {
                name: 'Memory Stress Test',
                type: 'memoryUsage',
                parameters: {
                    gameStateSize: 10000, // bytes per game
                    concurrentGames: 50,
                    updateFrequency: 10 // per second
                }
            },
            {
                name: 'Spike Load Test',
                type: 'loadSpike',
                parameters: {
                    normalLoad: 20,
                    spikeLoad: 200,
                    spikeDuration: 10000,
                    totalTestDuration: 60000
                }
            }
        ];
    }

    // Run all test scenarios
    async runAllTests() {
        console.log('🚀 Starting comprehensive load testing...');
        this.initTestScenarios();
        
        for (const scenario of this.testScenarios) {
            console.log(`\n📊 Running test: ${scenario.name}`);
            await this.runScenario(scenario);
            
            // Brief pause between tests
            await this.sleep(2000);
        }
        
        this.generateReport();
    }

    // Run individual test scenario
    async runScenario(scenario) {
        const startTime = Date.now();
        const scenarioResult = {
            name: scenario.name,
            type: scenario.type,
            startTime: startTime,
            parameters: scenario.parameters,
            results: {}
        };

        try {
            switch (scenario.type) {
                case 'connection':
                    scenarioResult.results = await this.testConnections(scenario.parameters);
                    break;
                case 'roomCreation':
                    scenarioResult.results = await this.testRoomCreation(scenario.parameters);
                    break;
                case 'gameUpdates':
                    scenarioResult.results = await this.testGameUpdates(scenario.parameters);
                    break;
                case 'playerChurn':
                    scenarioResult.results = await this.testPlayerChurn(scenario.parameters);
                    break;
                case 'messageFlood':
                    scenarioResult.results = await this.testMessageFlood(scenario.parameters);
                    break;
                case 'networkResilience':
                    scenarioResult.results = await this.testNetworkResilience(scenario.parameters);
                    break;
                case 'memoryUsage':
                    scenarioResult.results = await this.testMemoryUsage(scenario.parameters);
                    break;
                case 'loadSpike':
                    scenarioResult.results = await this.testLoadSpike(scenario.parameters);
                    break;
            }
        } catch (error) {
            scenarioResult.error = error.message;
            console.error(`Test scenario ${scenario.name} failed:`, error);
        }

        scenarioResult.endTime = Date.now();
        scenarioResult.duration = scenarioResult.endTime - scenarioResult.startTime;
        
        this.testResults.push(scenarioResult);
        return scenarioResult;
    }

    // Test concurrent connections
    async testConnections(params) {
        console.log(`Testing ${params.concurrentUsers} concurrent connections...`);
        
        const promises = [];
        const connectionTimes = [];
        
        for (let i = 0; i < params.concurrentUsers; i++) {
            promises.push(this.simulateConnection(i, connectionTimes));
            
            // Stagger connections
            if (i % 5 === 0) {
                await this.sleep(params.rampUpTime / 5);
            }
        }
        
        const results = await Promise.allSettled(promises);
        
        return {
            successfulConnections: results.filter(r => r.status === 'fulfilled').length,
            failedConnections: results.filter(r => r.status === 'rejected').length,
            averageConnectionTime: connectionTimes.reduce((a, b) => a + b, 0) / connectionTimes.length,
            connectionTimes: connectionTimes
        };
    }

    // Test room creation stress
    async testRoomCreation(params) {
        console.log(`Testing room creation: ${params.roomsPerSecond} rooms/sec...`);
        
        const roomCreationTimes = [];
        const startTime = Date.now();
        let roomsCreated = 0;
        
        while (roomsCreated < params.totalRooms && Date.now() - startTime < 30000) {
            const batchStart = Date.now();
            const batchPromises = [];
            
            // Create batch of rooms
            const batchSize = Math.min(params.roomsPerSecond, 10);
            for (let i = 0; i < batchSize && roomsCreated < params.totalRooms; i++) {
                batchPromises.push(this.simulateRoomCreation(roomsCreated + i, roomCreationTimes));
            }
            
            await Promise.allSettled(batchPromises);
            roomsCreated += batchPromises.length;
            
            // Rate limiting
            const batchTime = Date.now() - batchStart;
            const expectedTime = 1000; // 1 second
            if (batchTime < expectedTime) {
                await this.sleep(expectedTime - batchTime);
            }
        }
        
        return {
            totalRooms: roomsCreated,
            totalTime: Date.now() - startTime,
            averageCreationTime: roomCreationTimes.reduce((a, b) => a + b, 0) / roomCreationTimes.length
        };
    }

    // Test game state updates
    async testGameUpdates(params) {
        console.log(`Testing game updates: ${params.updatesPerSecond} updates/sec...`);
        
        const updateTimes = [];
        const startTime = Date.now();
        let updatesSent = 0;
        
        // Create simulated games
        const games = [];
        for (let i = 0; i < params.concurrentGames; i++) {
            games.push({
                id: `game_${i}`,
                state: this.generateGameState(1000)
            });
        }
        
        while (updatesSent < params.totalUpdates) {
            const batchStart = Date.now();
            const batchPromises = [];
            
            // Send batch of updates
            const batchSize = Math.min(params.updatesPerSecond, 20);
            for (let i = 0; i < batchSize && updatesSent < params.totalUpdates; i++) {
                const gameIndex = i % games.length;
                batchPromises.push(this.simulateGameUpdate(games[gameIndex], updateTimes));
            }
            
            await Promise.allSettled(batchPromises);
            updatesSent += batchPromises.length;
            
            // Rate limiting
            const batchTime = Date.now() - batchStart;
            const expectedTime = 1000;
            if (batchTime < expectedTime) {
                await this.sleep(expectedTime - batchTime);
            }
        }
        
        return {
            totalUpdates: updatesSent,
            totalTime: Date.now() - startTime,
            averageUpdateTime: updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length,
            throughput: updatesSent / ((Date.now() - startTime) / 1000)
        };
    }

    // Test player join/leave churn
    async testPlayerChurn(params) {
        console.log(`Testing player churn: ${params.joinRate} joins/sec, ${params.leaveRate} leaves/sec...`);
        
        const activePlayers = [];
        const joinTimes = [];
        const leaveTimes = [];
        const startTime = Date.now();
        
        while (Date.now() - startTime < params.testDuration) {
            // Simulate joins
            if (Math.random() < params.joinRate / 10 && activePlayers.length < params.maxConcurrentPlayers) {
                const playerId = `player_${Date.now()}_${Math.random()}`;
                const joinStart = Date.now();
                activePlayers.push({ id: playerId, joinTime: joinStart });
                joinTimes.push(Date.now() - joinStart);
            }
            
            // Simulate leaves
            if (Math.random() < params.leaveRate / 10 && activePlayers.length > 0) {
                const leavingPlayer = activePlayers.shift();
                const leaveStart = Date.now();
                leaveTimes.push(Date.now() - leaveStart);
            }
            
            await this.sleep(100); // 100ms intervals
        }
        
        return {
            peakConcurrentPlayers: activePlayers.length,
            totalJoins: joinTimes.length,
            totalLeaves: leaveTimes.length,
            averageJoinTime: joinTimes.reduce((a, b) => a + b, 0) / Math.max(joinTimes.length, 1),
            averageLeaveTime: leaveTimes.reduce((a, b) => a + b, 0) / Math.max(leaveTimes.length, 1)
        };
    }

    // Test message flooding
    async testMessageFlood(params) {
        console.log(`Testing message flood: ${params.messagesPerSecond} messages/sec...`);
        
        const messageTimes = [];
        const startTime = Date.now();
        let messagesSent = 0;
        
        // Create connections
        const connections = [];
        for (let i = 0; i < params.concurrentConnections; i++) {
            connections.push(this.simulateConnection(i, []));
        }
        
        while (messagesSent < params.totalUpdates) {
            const batchStart = Date.now();
            const batchPromises = [];
            
            // Send batch of messages
            const batchSize = Math.min(params.messagesPerSecond, 50);
            for (let i = 0; i < batchSize && messagesSent < params.totalUpdates; i++) {
                const connectionIndex = i % connections.length;
                const message = this.generateMessage(params.messageSize);
                batchPromises.push(this.simulateMessage(connections[connectionIndex], message, messageTimes));
            }
            
            await Promise.allSettled(batchPromises);
            messagesSent += batchPromises.length;
            
            // Rate limiting
            const batchTime = Date.now() - batchStart;
            const expectedTime = 1000;
            if (batchTime < expectedTime) {
                await this.sleep(expectedTime - batchTime);
            }
        }
        
        return {
            totalMessages: messagesSent,
            totalTime: Date.now() - startTime,
            averageMessageTime: messageTimes.reduce((a, b) => a + b, 0) / Math.max(messageTimes.length, 1),
            throughput: messagesSent / ((Date.now() - startTime) / 1000)
        };
    }

    // Test network resilience
    async testNetworkResilience(params) {
        console.log('Testing network resilience with disconnections...');
        
        const connections = [];
        const reconnectionTimes = [];
        const lostMessages = [];
        const startTime = Date.now();
        
        // Create initial connections
        for (let i = 0; i < 10; i++) {
            connections.push(this.simulateConnection(i, []));
        }
        
        while (Date.now() - startTime < params.testDuration) {
            // Simulate random disconnections
            for (let i = 0; i < connections.length; i++) {
                if (Math.random() < params.disconnectionRate && connections[i].connected) {
                    const reconnectStart = Date.now();
                    connections[i].connected = false;
                    
                    // Simulate messages lost during disconnection
                    const messagesLost = Math.floor(Math.random() * 5);
                    lostMessages.push(messagesLost);
                    
                    // Reconnect after delay
                    setTimeout(() => {
                        connections[i].connected = true;
                        reconnectionTimes.push(Date.now() - reconnectStart);
                    }, params.reconnectionDelay);
                }
            }
            
            await this.sleep(1000); // Check every second
        }
        
        return {
            totalDisconnections: lostMessages.length,
            averageReconnectionTime: reconnectionTimes.reduce((a, b) => a + b, 0) / Math.max(reconnectionTimes.length, 1),
            messagesLost: lostMessages.reduce((a, b) => a + b, 0)
        };
    }

    // Test memory usage
    async testMemoryUsage(params) {
        console.log(`Testing memory usage with ${params.concurrentGames} games...`);
        
        const games = [];
        const memorySnapshots = [];
        const startTime = Date.now();
        
        // Create games with large state
        for (let i = 0; i < params.concurrentGames; i++) {
            games.push({
                id: `game_${i}`,
                state: this.generateGameState(params.gameStateSize)
            });
        }
        
        // Simulate updates and measure memory
        for (let i = 0; i < 100; i++) { // 100 update cycles
            const updateStart = Date.now();
            
            for (const game of games) {
                // Simulate state update
                game.state = this.generateGameState(params.gameStateSize);
                
                // Measure memory usage (simulated)
                if (i % 10 === 0) {
                    memorySnapshots.push({
                        timestamp: Date.now(),
                        estimatedMemory: this.estimateMemoryUsage(games),
                        gameStateSize: params.gameStateSize
                    });
                }
            }
            
            // Rate limiting
            const updateTime = Date.now() - updateStart;
            const expectedTime = 1000 / params.updateFrequency;
            if (updateTime < expectedTime) {
                await this.sleep(expectedTime - updateTime);
            }
        }
        
        return {
            peakMemoryUsage: Math.max(...memorySnapshots.map(s => s.estimatedMemory)),
            averageMemoryUsage: memorySnapshots.reduce((a, b) => a + b.estimatedMemory, 0) / memorySnapshots.length,
            totalUpdates: 100 * params.concurrentGames
        };
    }

    // Test load spike
    async testLoadSpike(params) {
        console.log(`Testing load spike: ${params.spikeLoad} concurrent users...`);
        
        const metrics = {
            normalPhase: {},
            spikePhase: {},
            recoveryPhase: {}
        };
        
        // Normal phase
        console.log('Normal load phase...');
        const normalStart = Date.now();
        await this.simulateLoad(params.normalLoad, 10000);
        metrics.normalPhase = this.collectMetrics();
        
        // Spike phase
        console.log('Spike phase...');
        const spikeStart = Date.now();
        await this.simulateLoad(params.spikeLoad, params.spikeDuration);
        metrics.spikePhase = this.collectMetrics();
        
        // Recovery phase
        console.log('Recovery phase...');
        const recoveryStart = Date.now();
        await this.simulateLoad(params.normalLoad, 10000);
        metrics.recoveryPhase = this.collectMetrics();
        
        return {
            normalPhase: metrics.normalPhase,
            spikePhase: metrics.spikePhase,
            recoveryPhase: metrics.recoveryPhase,
            totalTestTime: Date.now() - normalStart
        };
    }

    // Simulation helper functions
    async simulateConnection(id, timeArray) {
        const start = Date.now();
        await this.sleep(Math.random() * 100 + 50); // 50-150ms connection time
        timeArray.push(Date.now() - start);
        return { id: id, connected: true };
    }

    async simulateRoomCreation(roomId, timeArray) {
        const start = Date.now();
        await this.sleep(Math.random() * 50 + 20); // 20-70ms creation time
        timeArray.push(Date.now() - start);
        return { id: roomId, created: true };
    }

    async simulateGameUpdate(game, timeArray) {
        const start = Date.now();
        await this.sleep(Math.random() * 10 + 5); // 5-15ms update time
        timeArray.push(Date.now() - start);
        return { gameId: game.id, updated: true };
    }

    async simulateMessage(connection, message, timeArray) {
        const start = Date.now();
        await this.sleep(Math.random() * 5 + 2); // 2-7ms message time
        timeArray.push(Date.now() - start);
        return { connectionId: connection.id, message: message };
    }

    generateGameState(size) {
        // Generate random game state of specified size
        const state = new Array(size);
        for (let i = 0; i < size; i++) {
            state[i] = Math.random().toString(36);
        }
        return state;
    }

    generateMessage(size) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let message = '';
        for (let i = 0; i < size; i++) {
            message += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return message;
    }

    estimateMemoryUsage(games) {
        // Rough estimation: each game state + overhead
        return games.reduce((total, game) => {
            return total + (game.state.length * 2 + 100); // 2 bytes per char + 100 bytes overhead
        }, 0);
    }

    async simulateLoad(concurrentUsers, duration) {
        const connections = [];
        for (let i = 0; i < concurrentUsers; i++) {
            connections.push(this.simulateConnection(i, []));
        }
        
        await this.sleep(duration);
        return connections.length;
    }

    collectMetrics() {
        return {
            timestamp: Date.now(),
            activeConnections: this.activeConnections.length,
            memoryUsage: this.estimateMemoryUsage([{ state: new Array(1000) }]), // Rough estimate
            responseTime: Math.random() * 50 + 10 // 10-60ms
        };
    }

    // Generate comprehensive test report
    generateReport() {
        console.log('\n📊 LOAD TESTING REPORT');
        console.log('='.repeat(50));
        
        for (const result of this.testResults) {
            console.log(`\n🧪 ${result.name}`);
            console.log(`   Type: ${result.type}`);
            console.log(`   Duration: ${result.duration}ms`);
            console.log(`   Parameters:`, result.parameters);
            console.log(`   Results:`, result.results);
            
            if (result.error) {
                console.log(`   ❌ ERROR: ${result.error}`);
            } else {
                console.log(`   ✅ COMPLETED SUCCESSFULLY`);
            }
        }
        
        // Summary
        console.log('\n📈 SUMMARY');
        console.log('='.repeat(50));
        const totalTests = this.testResults.length;
        const successfulTests = this.testResults.filter(r => !r.error).length;
        const failedTests = this.testResults.filter(r => r.error).length;
        
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Successful: ${successfulTests}`);
        console.log(`Failed: ${failedTests}`);
        console.log(`Success Rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);
        
        // Performance metrics
        this.calculatePerformanceMetrics();
    }

    calculatePerformanceMetrics() {
        console.log('\n📊 PERFORMANCE METRICS');
        console.log('-'.repeat(30));
        
        // Aggregate metrics across all tests
        const allResponseTimes = [];
        const allThroughputs = [];
        
        for (const result of this.testResults) {
            if (result.results.averageConnectionTime) {
                allResponseTimes.push(result.results.averageConnectionTime);
            }
            if (result.results.throughput) {
                allThroughputs.push(result.results.throughput);
            }
        }
        
        if (allResponseTimes.length > 0) {
            const avgResponseTime = allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length;
            const minResponseTime = Math.min(...allResponseTimes);
            const maxResponseTime = Math.max(...allResponseTimes);
            
            console.log(`Response Times:`);
            console.log(`  Average: ${avgResponseTime.toFixed(2)}ms`);
            console.log(`  Min: ${minResponseTime.toFixed(2)}ms`);
            console.log(`  Max: ${maxResponseTime.toFixed(2)}ms`);
        }
        
        if (allThroughputs.length > 0) {
            const avgThroughput = allThroughputs.reduce((a, b) => a + b, 0) / allThroughputs.length;
            const maxThroughput = Math.max(...allThroughputs);
            
            console.log(`Throughput:`);
            console.log(`  Average: ${avgThroughput.toFixed(2)} ops/sec`);
            console.log(`  Peak: ${maxThroughput.toFixed(2)} ops/sec`);
        }
    }

    // Utility function for delays
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for global use
window.LoadTestingSystem = LoadTestingSystem;
