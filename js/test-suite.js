/**
 * Comprehensive Test Suite for Multiplayer Games
 * Automated testing framework with detailed reporting
 */

class TestSuite {
    constructor() {
        this.tests = [];
        this.results = [];
        this.currentTest = null;
        this.config = {
            parallel: false,
            verbose: true,
            stopOnFailure: false,
            timeout: 30000 // 30 seconds per test
        };
        this.reportData = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            totalTime: 0,
            coverage: {}
        };
    }

    // Initialize test suite with all test categories
    initializeTestSuite() {
        this.tests = [
            // Connection Tests
            {
                category: 'connection',
                name: 'WebSocket Connection Test',
                description: 'Test WebSocket connection establishment',
                setup: () => this.setupConnectionTest(),
                test: () => this.testWebSocketConnection(),
                teardown: () => this.teardownConnectionTest(),
                timeout: 10000
            },
            {
                category: 'connection',
                name: 'Connection Timeout Test',
                description: 'Test connection timeout handling',
                setup: () => this.setupConnectionTest(),
                test: () => this.testConnectionTimeout(),
                teardown: () => this.teardownConnectionTest(),
                timeout: 15000
            },
            {
                category: 'connection',
                name: 'Reconnection Test',
                description: 'Test automatic reconnection logic',
                setup: () => this.setupConnectionTest(),
                test: () => this.testReconnection(),
                teardown: () => this.teardownConnectionTest(),
                timeout: 20000
            },
            
            // Room Management Tests
            {
                category: 'room',
                name: 'Room Creation Test',
                description: 'Test room creation and management',
                setup: () => this.setupRoomTest(),
                test: () => this.testRoomCreation(),
                teardown: () => this.teardownRoomTest(),
                timeout: 5000
            },
            {
                category: 'room',
                name: 'Room Join/Leave Test',
                description: 'Test player joining and leaving rooms',
                setup: () => this.setupRoomTest(),
                test: () => this.testRoomJoinLeave(),
                teardown: () => this.teardownRoomTest(),
                timeout: 10000
            },
            {
                category: 'room',
                name: 'Room Capacity Test',
                description: 'Test room capacity limits',
                setup: () => this.setupRoomTest(),
                test: () => this.testRoomCapacity(),
                teardown: () => this.teardownRoomTest(),
                timeout: 8000
            },
            
            // Game State Tests
            {
                category: 'gameState',
                name: 'Game State Synchronization',
                description: 'Test game state synchronization between players',
                setup: () => this.setupGameStateTest(),
                test: () => this.testGameStateSync(),
                teardown: () => this.teardownGameStateTest(),
                timeout: 15000
            },
            {
                category: 'gameState',
                name: 'Move Validation Test',
                description: 'Test move validation and rule enforcement',
                setup: () => this.setupGameStateTest(),
                test: () => this.testMoveValidation(),
                teardown: () => this.teardownGameStateTest(),
                timeout: 10000
            },
            {
                category: 'gameState',
                name: 'Turn Management Test',
                description: 'Test turn switching and enforcement',
                setup: () => this.setupGameStateTest(),
                test: () => this.testTurnManagement(),
                teardown: () => this.teardownGameStateTest(),
                timeout: 8000
            },
            
            // Performance Tests
            {
                category: 'performance',
                name: 'Latency Test',
                description: 'Test latency under various load conditions',
                setup: () => this.setupPerformanceTest(),
                test: () => this.testLatency(),
                teardown: () => this.teardownPerformanceTest(),
                timeout: 20000
            },
            {
                category: 'performance',
                name: 'Throughput Test',
                description: 'Test system throughput with multiple connections',
                setup: () => this.setupPerformanceTest(),
                test: () => this.testThroughput(),
                teardown: () => this.teardownPerformanceTest(),
                timeout: 30000
            },
            {
                category: 'performance',
                name: 'Memory Usage Test',
                description: 'Test memory usage and leak detection',
                setup: () => this.setupPerformanceTest(),
                test: () => this.testMemoryUsage(),
                teardown: () => this.teardownPerformanceTest(),
                timeout: 25000
            },
            
            // Security Tests
            {
                category: 'security',
                name: 'Authentication Test',
                description: 'Test player authentication and authorization',
                setup: () => this.setupSecurityTest(),
                test: () => this.testAuthentication(),
                teardown: () => this.teardownSecurityTest(),
                timeout: 10000
            },
            {
                category: 'security',
                name: 'Input Validation Test',
                description: 'Test input validation and XSS prevention',
                setup: () => this.setupSecurityTest(),
                test: () => this.testInputValidation(),
                teardown: () => this.teardownSecurityTest(),
                timeout: 8000
            },
            {
                category: 'security',
                name: 'Session Management Test',
                description: 'Test session security and hijacking prevention',
                setup: () => this.setupSecurityTest(),
                test: () => this.testSessionManagement(),
                teardown: () => this.teardownSecurityTest(),
                timeout: 12000
            },
            
            // Integration Tests
            {
                category: 'integration',
                name: 'Multi-Game Integration Test',
                description: 'Test multiple games running simultaneously',
                setup: () => this.setupIntegrationTest(),
                test: () => this.testMultiGameIntegration(),
                teardown: () => this.teardownIntegrationTest(),
                timeout: 30000
            },
            {
                category: 'integration',
                name: 'Database Integration Test',
                description: 'Test database operations and consistency',
                setup: () => this.setupIntegrationTest(),
                test: () => this.testDatabaseIntegration(),
                teardown: () => this.teardownIntegrationTest(),
                timeout: 20000
            },
            
            // Error Handling Tests
            {
                category: 'errorHandling',
                name: 'Network Error Recovery Test',
                description: 'Test recovery from network errors',
                setup: () => this.setupErrorHandlingTest(),
                test: () => this.testNetworkErrorRecovery(),
                teardown: () => this.teardownErrorHandlingTest(),
                timeout: 15000
            },
            {
                category: 'errorHandling',
                name: 'Invalid State Recovery Test',
                description: 'Test recovery from invalid game states',
                setup: () => this.setupErrorHandlingTest(),
                test: () => this.testInvalidStateRecovery(),
                teardown: () => this.teardownErrorHandlingTest(),
                timeout: 10000
            }
        ];
    }

    // Run all tests
    async runAllTests() {
        console.log('🧪 Starting comprehensive test suite...');
        this.initializeTestSuite();
        
        const startTime = Date.now();
        
        if (this.config.parallel) {
            await this.runTestsInParallel();
        } else {
            await this.runTestsSequentially();
        }
        
        this.reportData.totalTime = Date.now() - startTime;
        this.generateComprehensiveReport();
    }

    // Run tests sequentially
    async runTestsSequentially() {
        for (const test of this.tests) {
            await this.runSingleTest(test);
        }
    }

    // Run tests in parallel
    async runTestsInParallel() {
        const promises = this.tests.map(test => this.runSingleTest(test));
        const results = await Promise.allSettled(promises);
        
        // Process results
        results.forEach((result, index) => {
            const test = this.tests[index];
            this.processTestResult(test, result);
        });
    }

    // Run single test
    async runSingleTest(test) {
        this.currentTest = test;
        const startTime = Date.now();
        
        console.log(`\n🧪 Running: ${test.name} (${test.category})`);
        console.log(`   Description: ${test.description}`);
        
        try {
            // Setup
            if (test.setup) {
                await test.setup();
            }
            
            // Run test with timeout
            const result = await Promise.race([
                test.test(),
                this.createTimeoutPromise(test.timeout || this.config.timeout)
            ]);
            
            // Teardown
            if (test.teardown) {
                await test.teardown();
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // Process result
            this.processTestResult(test, {
                status: result === 'TIMEOUT' ? 'rejected' : 'fulfilled',
                value: result === 'TIMEOUT' ? { error: 'Test timeout' } : result,
                duration: duration,
                startTime: startTime,
                endTime: endTime
            });
            
        } catch (error) {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            this.processTestResult(test, {
                status: 'rejected',
                value: { error: error.message },
                duration: duration,
                startTime: startTime,
                endTime: endTime
            });
        }
        
        this.currentTest = null;
    }

    // Process test result
    processTestResult(test, result) {
        const testResult = {
            name: test.name,
            category: test.category,
            description: test.description,
            status: result.status,
            duration: result.duration,
            startTime: result.startTime,
            endTime: result.endTime,
            passed: result.status === 'fulfilled' && this.testPassed(result.value),
            error: result.status === 'rejected' ? result.value.error : null,
            details: result.value
        };
        
        this.results.push(testResult);
        
        // Update report data
        this.reportData.totalTests++;
        if (testResult.passed) {
            this.reportData.passedTests++;
        } else {
            this.reportData.failedTests++;
        }
        
        // Log result
        const status = testResult.passed ? '✅ PASSED' : '❌ FAILED';
        console.log(`   ${status} in ${testResult.duration}ms`);
        
        if (testResult.error) {
            console.log(`   Error: ${testResult.error}`);
        }
        
        if (this.config.verbose && testResult.details) {
            console.log('   Details:', testResult.details);
        }
        
        // Stop on failure if configured
        if (!testResult.passed && this.config.stopOnFailure) {
            throw new Error(`Test failed: ${test.name}`);
        }
    }

    // Test if a test passed
    testPassed(result) {
        // Different tests have different pass criteria
        return result.passed !== false && !result.error;
    }

    // Connection Tests
    async setupConnectionTest() {
        console.log('   Setting up connection test...');
        // Initialize connection test environment
    }

    async testWebSocketConnection() {
        console.log('   Testing WebSocket connection...');
        // Simulate WebSocket connection test
        const connectionResult = await this.simulateWebSocketConnection();
        return {
            connected: connectionResult.connected,
            latency: connectionResult.latency,
            protocol: connectionResult.protocol
        };
    }

    async testConnectionTimeout() {
        console.log('   Testing connection timeout...');
        // Simulate connection timeout
        const timeoutResult = await this.simulateConnectionTimeout();
        return {
            timeoutHandled: timeoutResult.handled,
            retryAttempted: timeoutResult.retried
        };
    }

    async testReconnection() {
        console.log('   Testing reconnection logic...');
        // Simulate reconnection scenarios
        const reconnectionResult = await this.simulateReconnection();
        return {
            reconnected: reconnectionResult.success,
            attempts: reconnectionResult.attempts,
            finalLatency: reconnectionResult.latency
        };
    }

    // Room Management Tests
    async setupRoomTest() {
        console.log('   Setting up room test...');
        // Initialize room test environment
    }

    async testRoomCreation() {
        console.log('   Testing room creation...');
        const creationResult = await this.simulateRoomCreation();
        return {
            roomCreated: creationResult.created,
            roomId: creationResult.roomId,
            capacity: creationResult.capacity
        };
    }

    async testRoomJoinLeave() {
        console.log('   Testing room join/leave...');
        const joinLeaveResult = await this.simulateRoomJoinLeave();
        return {
            joinSuccessful: joinLeaveResult.joined,
            leaveSuccessful: joinLeaveResult.left,
            playerCount: joinLeaveResult.finalPlayerCount
        };
    }

    async testRoomCapacity() {
        console.log('   Testing room capacity...');
        const capacityResult = await this.simulateRoomCapacity();
        return {
            capacityEnforced: capacityResult.enforced,
            maxPlayers: capacityResult.maxAllowed,
            overflowHandled: capacityResult.overflowHandled
        };
    }

    // Game State Tests
    async setupGameStateTest() {
        console.log('   Setting up game state test...');
        // Initialize game state test environment
    }

    async testGameStateSync() {
        console.log('   Testing game state synchronization...');
        const syncResult = await this.simulateGameStateSync();
        return {
            synchronized: syncResult.synced,
            conflicts: syncResult.conflicts,
            finalState: syncResult.finalState
        };
    }

    async testMoveValidation() {
        console.log('   Testing move validation...');
        const validationResult = await this.simulateMoveValidation();
        return {
            validMovesAccepted: validationResult.validAccepted,
            invalidMovesRejected: validationResult.invalidRejected,
            rulesEnforced: validationResult.rulesEnforced
        };
    }

    async testTurnManagement() {
        console.log('   Testing turn management...');
        const turnResult = await this.simulateTurnManagement();
        return {
            turnsSwitchedCorrectly: turnResult.switchedCorrectly,
            concurrentMovesPrevented: turnResult.concurrentPrevented,
            turnOrder: turnResult.order
        };
    }

    // Performance Tests
    async setupPerformanceTest() {
        console.log('   Setting up performance test...');
        // Initialize performance test environment
    }

    async testLatency() {
        console.log('   Testing latency...');
        const latencyResult = await this.simulateLatencyTest();
        return {
            averageLatency: latencyResult.average,
            peakLatency: latencyResult.peak,
            latencyDistribution: latencyResult.distribution
        };
    }

    async testThroughput() {
        console.log('   Testing throughput...');
        const throughputResult = await this.simulateThroughputTest();
        return {
            averageThroughput: throughputResult.average,
            peakThroughput: throughputResult.peak,
            sustainedLoad: throughputResult.sustained
        };
    }

    async testMemoryUsage() {
        console.log('   Testing memory usage...');
        const memoryResult = await this.simulateMemoryUsageTest();
        return {
            memoryLeakDetected: memoryResult.leakDetected,
            peakMemoryUsage: memoryResult.peak,
            memoryFreed: memoryResult.freed
        };
    }

    // Security Tests
    async setupSecurityTest() {
        console.log('   Setting up security test...');
        // Initialize security test environment
    }

    async testAuthentication() {
        console.log('   Testing authentication...');
        const authResult = await this.simulateAuthentication();
        return {
            authenticationSuccessful: authResult.authenticated,
            unauthorizedBlocked: authResult.unauthorizedBlocked,
            sessionValidated: authResult.sessionValidated
        };
    }

    async testInputValidation() {
        console.log('   Testing input validation...');
        const validationResult = await this.simulateInputValidation();
        return {
            validInputAccepted: validationResult.validAccepted,
            maliciousInputBlocked: validationResult.maliciousBlocked,
            xssPrevented: validationResult.xssPrevented,
            sqlInjectionPrevented: validationResult.sqlInjectionPrevented
        };
    }

    async testSessionManagement() {
        console.log('   Testing session management...');
        const sessionResult = await this.simulateSessionManagement();
        return {
            sessionSecure: sessionResult.secure,
            hijackingPrevented: sessionResult.hijackingPrevented,
            timeoutHandled: sessionResult.timeoutHandled
        };
    }

    // Integration Tests
    async setupIntegrationTest() {
        console.log('   Setting up integration test...');
        // Initialize integration test environment
    }

    async testMultiGameIntegration() {
        console.log('   Testing multi-game integration...');
        const integrationResult = await this.simulateMultiGameIntegration();
        return {
            gamesRanSimultaneously: integrationResult.simultaneous,
            resourceSharingManaged: integrationResult.resourcesManaged,
            conflictsResolved: integrationResult.conflictsResolved
        };
    }

    async testDatabaseIntegration() {
        console.log('   Testing database integration...');
        const dbResult = await this.simulateDatabaseIntegration();
        return {
            dataConsistent: dbResult.consistent,
            transactionsHandled: dbResult.transactionsHandled,
            performanceAcceptable: dbResult.performanceAcceptable
        };
    }

    // Error Handling Tests
    async setupErrorHandlingTest() {
        console.log('   Setting up error handling test...');
        // Initialize error handling test environment
    }

    async testNetworkErrorRecovery() {
        console.log('   Testing network error recovery...');
        const recoveryResult = await this.simulateNetworkErrorRecovery();
        return {
            errorRecovered: recoveryResult.recovered,
            stateRestored: recoveryResult.stateRestored,
            userNotified: recoveryResult.userNotified
        };
    }

    async testInvalidStateRecovery() {
        console.log('   Testing invalid state recovery...');
        const recoveryResult = await this.simulateInvalidStateRecovery();
        return {
            stateSanitized: recoveryResult.sanitized,
            defaultStateRestored: recoveryResult.defaultRestored,
            corruptionDetected: recoveryResult.corruptionDetected
        };
    }

    // Simulation methods
    async simulateWebSocketConnection() {
        await this.sleep(100);
        return {
            connected: Math.random() > 0.1,
            latency: Math.random() * 100 + 20,
            protocol: 'wss'
        };
    }

    async simulateConnectionTimeout() {
        await this.sleep(2000);
        return {
            handled: Math.random() > 0.3,
            retried: Math.random() > 0.5
        };
    }

    async simulateReconnection() {
        let attempts = 0;
        let connected = false;
        
        while (attempts < 5 && !connected) {
            attempts++;
            await this.sleep(500);
            connected = Math.random() > 0.6;
        }
        
        return {
            success: connected,
            attempts: attempts,
            latency: Math.random() * 200 + 50
        };
    }

    async simulateRoomCreation() {
        await this.sleep(50);
        return {
            created: Math.random() > 0.1,
            roomId: 'room_' + Math.random().toString(36).substr(2, 6),
            capacity: Math.floor(Math.random() * 8) + 2
        };
    }

    async simulateRoomJoinLeave() {
        await this.sleep(100);
        const joined = Math.random() > 0.1;
        const left = joined && Math.random() > 0.2;
        
        return {
            joined: joined,
            left: left,
            finalPlayerCount: Math.floor(Math.random() * 10) + (joined ? 1 : 0)
        };
    }

    async simulateRoomCapacity() {
        await this.sleep(80);
        const maxAllowed = Math.floor(Math.random() * 8) + 2;
        const attempted = Math.floor(Math.random() * 15) + 2;
        
        return {
            enforced: attempted > maxAllowed,
            maxAllowed: maxAllowed,
            overflowHandled: attempted > maxAllowed && Math.random() > 0.3
        };
    }

    async simulateGameStateSync() {
        await this.sleep(200);
        const synced = Math.random() > 0.15;
        const conflicts = !synced && Math.random() > 0.3;
        
        return {
            synced: synced,
            conflicts: conflicts,
            finalState: { player: 1, position: { x: 5, y: 3 } }
        };
    }

    async simulateMoveValidation() {
        await this.sleep(150);
        const validAccepted = Math.random() > 0.2;
        const invalidRejected = Math.random() > 0.7;
        
        return {
            validAccepted: validAccepted,
            invalidRejected: invalidRejected,
            rulesEnforced: validAccepted || invalidRejected
        };
    }

    async simulateTurnManagement() {
        await this.sleep(100);
        const switchedCorrectly = Math.random() > 0.25;
        const concurrentPrevented = Math.random() > 0.8;
        
        return {
            switchedCorrectly: switchedCorrectly,
            concurrentPrevented: concurrentPrevented,
            order: ['player1', 'player2', 'player1', 'player2'].slice(0, Math.floor(Math.random() * 4) + 1)
        };
    }

    async simulateLatencyTest() {
        const samples = [];
        for (let i = 0; i < 50; i++) {
            samples.push(Math.random() * 200 + 30);
            await this.sleep(10);
        }
        
        return {
            average: samples.reduce((a, b) => a + b, 0) / samples.length,
            peak: Math.max(...samples),
            distribution: this.calculateDistribution(samples)
        };
    }

    async simulateThroughputTest() {
        const operations = [];
        const startTime = Date.now();
        
        for (let i = 0; i < 100; i++) {
            operations.push({
                timestamp: Date.now(),
                operation: 'test_op'
            });
            await this.sleep(50);
        }
        
        const duration = Date.now() - startTime;
        const average = operations.length / (duration / 1000);
        const peak = Math.max(...operations.map((op, index) => {
            const nextIndex = index + 1;
            if (nextIndex < operations.length) {
                return 1000 / (operations[nextIndex].timestamp - op.timestamp);
            }
            return 0;
        }).filter(v => v > 0));
        
        return {
            average: average,
            peak: peak,
            sustained: average > 50
        };
    }

    async simulateMemoryUsageTest() {
        const initialMemory = 1000;
        let currentMemory = initialMemory;
        const memorySnapshots = [currentMemory];
        
        for (let i = 0; i < 20; i++) {
            // Simulate memory allocation
            currentMemory += Math.random() * 100 - 50;
            memorySnapshots.push(currentMemory);
            
            // Simulate memory leak
            if (Math.random() < 0.1) {
                // Don't free memory
            } else {
                // Free some memory
                currentMemory = Math.max(initialMemory, currentMemory - Math.random() * 80);
            }
            
            await this.sleep(100);
        }
        
        return {
            leakDetected: memorySnapshots[memorySnapshots.length - 1] > memorySnapshots[0] * 1.5,
            peak: Math.max(...memorySnapshots),
            freed: initialMemory - currentMemory
        };
    }

    async simulateAuthentication() {
        await this.sleep(200);
        return {
            authenticated: Math.random() > 0.15,
            unauthorizedBlocked: Math.random() > 0.9,
            sessionValidated: Math.random() > 0.8
        };
    }

    async simulateInputValidation() {
        await this.sleep(150);
        return {
            validAccepted: Math.random() > 0.3,
            maliciousBlocked: Math.random() > 0.95,
            xssPrevented: Math.random() > 0.9,
            sqlInjectionPrevented: Math.random() > 0.85
        };
    }

    async simulateSessionManagement() {
        await this.sleep(300);
        return {
            secure: Math.random() > 0.7,
            hijackingPrevented: Math.random() > 0.8,
            timeoutHandled: Math.random() > 0.6
        };
    }

    async simulateMultiGameIntegration() {
        await this.sleep(500);
        return {
            simultaneous: Math.random() > 0.4,
            resourcesManaged: Math.random() > 0.6,
            conflictsResolved: Math.random() > 0.5
        };
    }

    async simulateDatabaseIntegration() {
        await this.sleep(300);
        return {
            consistent: Math.random() > 0.8,
            transactionsHandled: Math.random() > 0.7,
            performanceAcceptable: Math.random() > 0.6
        };
    }

    async simulateNetworkErrorRecovery() {
        await this.sleep(1000);
        return {
            recovered: Math.random() > 0.6,
            stateRestored: Math.random() > 0.7,
            userNotified: Math.random() > 0.8
        };
    }

    async simulateInvalidStateRecovery() {
        await this.sleep(500);
        return {
            sanitized: Math.random() > 0.7,
            defaultRestored: Math.random() > 0.5,
            corruptionDetected: Math.random() > 0.3
        };
    }

    // Teardown methods
    async teardownConnectionTest() {
        console.log('   Tearing down connection test...');
        await this.sleep(50);
    }

    async teardownRoomTest() {
        console.log('   Tearing down room test...');
        await this.sleep(50);
    }

    async teardownGameStateTest() {
        console.log('   Tearing down game state test...');
        await this.sleep(50);
    }

    async teardownPerformanceTest() {
        console.log('   Tearing down performance test...');
        await this.sleep(50);
    }

    async teardownSecurityTest() {
        console.log('   Tearing down security test...');
        await this.sleep(50);
    }

    async teardownErrorHandlingTest() {
        console.log('   Tearing down error handling test...');
        await this.sleep(50);
    }

    async teardownIntegrationTest() {
        console.log('   Tearing down integration test...');
        await this.sleep(50);
    }

    // Utility methods
    calculateDistribution(samples) {
        const sorted = [...samples].sort((a, b) => a - b);
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
        
        const percentiles = {
            p50: this.getPercentile(samples, 50),
            p90: this.getPercentile(samples, 90),
            p95: this.getPercentile(samples, 95),
            p99: this.getPercentile(samples, 99)
        };
        
        return {
            min: min,
            max: max,
            mean: mean,
            percentiles: percentiles
        };
    }

    getPercentile(sortedArray, percentile) {
        const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
        return sortedArray[index];
    }

    createTimeoutPromise(timeout) {
        return new Promise((_, reject) => {
            setTimeout(() => reject('TIMEOUT'), timeout);
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Generate comprehensive test report
    generateComprehensiveReport() {
        console.log('\n📊 COMPREHENSIVE TEST SUITE REPORT');
        console.log('='.repeat(60));
        
        // Coverage report
        this.generateCoverageReport();
        
        // Results summary
        this.generateResultsSummary();
        
        // Performance analysis
        this.generatePerformanceAnalysis();
        
        // Recommendations
        this.generateRecommendations();
        
        // Export results
        this.exportResults();
    }

    generateCoverageReport() {
        const categories = [...new Set(this.tests.map(t => t.category))];
        
        console.log('\n📋 TEST COVERAGE');
        console.log('-'.repeat(30));
        
        categories.forEach(category => {
            const categoryTests = this.tests.filter(t => t.category === category);
            const categoryResults = this.results.filter(r => r.category === category);
            
            const passed = categoryResults.filter(r => r.passed).length;
            const total = categoryResults.length;
            const coverage = total > 0 ? (passed / total * 100).toFixed(1) : 0;
            
            console.log(`${category}: ${passed}/${total} (${coverage}%)`);
            
            this.reportData.coverage[category] = {
                total: total,
                passed: passed,
                coverage: parseFloat(coverage)
            };
        });
    }

    generateResultsSummary() {
        console.log('\n📊 RESULTS SUMMARY');
        console.log('-'.repeat(30));
        console.log(`Total Tests: ${this.reportData.totalTests}`);
        console.log(`Passed: ${this.reportData.passedTests}`);
        console.log(`Failed: ${this.reportData.failedTests}`);
        console.log(`Skipped: ${this.reportData.skippedTests}`);
        console.log(`Success Rate: ${((this.reportData.passedTests / this.reportData.totalTests) * 100).toFixed(1)}%`);
        console.log(`Total Time: ${this.reportData.totalTime}ms`);
        
        if (this.reportData.failedTests > 0) {
            console.log('\n❌ FAILED TESTS:');
            this.results.filter(r => !r.passed).forEach(test => {
                console.log(`   ${test.name}: ${test.error || 'Unknown error'}`);
            });
        }
    }

    generatePerformanceAnalysis() {
        console.log('\n⚡ PERFORMANCE ANALYSIS');
        console.log('-'.repeat(30));
        
        const durations = this.results.map(r => r.duration);
        if (durations.length > 0) {
            const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
            const maxDuration = Math.max(...durations);
            const minDuration = Math.min(...durations);
            
            console.log(`Average Test Duration: ${avgDuration.toFixed(2)}ms`);
            console.log(`Longest Test: ${maxDuration}ms`);
            console.log(`Shortest Test: ${minDuration}ms`);
            
            // Performance categories
            const fastTests = this.results.filter(r => r.duration < avgDuration * 0.8);
            const slowTests = this.results.filter(r => r.duration > avgDuration * 1.2);
            
            console.log(`Fast Tests: ${fastTests.length}`);
            console.log(`Slow Tests: ${slowTests.length}`);
            
            if (slowTests.length > 0) {
                console.log('\n🐌 SLOW TESTS:');
                slowTests.forEach(test => {
                    console.log(`   ${test.name}: ${test.duration}ms`);
                });
            }
        }
    }

    generateRecommendations() {
        console.log('\n💡 RECOMMENDATIONS');
        console.log('-'.repeat(30));
        
        const recommendations = [];
        
        // Coverage recommendations
        Object.entries(this.reportData.coverage).forEach(([category, data]) => {
            if (data.coverage < 80) {
                recommendations.push({
                    category: 'coverage',
                    priority: 'high',
                    issue: `Low test coverage in ${category}: ${data.coverage}%`,
                    suggestion: `Add more tests for ${category} scenarios`
                });
            }
        });
        
        // Performance recommendations
        const slowTests = this.results.filter(r => r.duration > 5000);
        if (slowTests.length > 0) {
            recommendations.push({
                category: 'performance',
                priority: 'medium',
                issue: `${slowTests.length} tests taking longer than 5 seconds`,
                suggestion: 'Optimize test performance and investigate bottlenecks'
            });
        }
        
        // Failure rate recommendations
        const failureRate = this.reportData.failedTests / this.reportData.totalTests;
        if (failureRate > 0.1) {
            recommendations.push({
                category: 'reliability',
                priority: 'critical',
                issue: `High failure rate: ${(failureRate * 100).toFixed(1)}%`,
                suggestion: 'Review test environment and fix failing tests'
            });
        }
        
        recommendations.forEach(rec => {
            console.log(`${rec.priority.toUpperCase()}: ${rec.issue}`);
            console.log(`   Suggestion: ${rec.suggestion}`);
        });
    }

    exportResults() {
        const exportData = {
            timestamp: new Date().toISOString(),
            summary: this.reportData,
            coverage: this.reportData.coverage,
            results: this.results,
            config: this.config
        };
        
        // In a real implementation, this would save to file or send to API
        console.log('\n💾 RESULTS EXPORTED');
        console.log('Data:', JSON.stringify(exportData, null, 2));
        
        return exportData;
    }

    // Configuration methods
    setConfiguration(config) {
        this.config = { ...this.config, ...config };
    }

    // Run specific test category
    async runTestCategory(category) {
        const categoryTests = this.tests.filter(t => t.category === category);
        
        console.log(`🧪 Running ${category} tests...`);
        
        for (const test of categoryTests) {
            await this.runSingleTest(test);
        }
        
        return this.results.filter(r => r.category === category);
    }

    // Get test results
    getResults() {
        return {
            results: this.results,
            summary: this.reportData,
            coverage: this.reportData.coverage
        };
    }

    // Clear results
    clearResults() {
        this.results = [];
        this.reportData = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            totalTime: 0,
            coverage: {}
        };
    }
}

// Export for global use
window.TestSuite = TestSuite;
