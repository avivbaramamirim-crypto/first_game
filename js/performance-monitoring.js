/**
 * Performance Monitoring System for Multiplayer Games
 * Real-time monitoring of latency, throughput, and system health
 */

class PerformanceMonitoringSystem {
    constructor() {
        this.metrics = {
            latency: {
                current: 0,
                average: 0,
                min: Infinity,
                max: 0,
                samples: []
            },
            throughput: {
                current: 0,
                average: 0,
                peak: 0,
                samples: []
            },
            errors: {
                count: 0,
                rate: 0,
                types: {},
                recent: []
            },
            resources: {
                memory: {
                    used: 0,
                    peak: 0,
                    trend: 'stable'
                },
                cpu: {
                    usage: 0,
                    trend: 'stable'
                },
                connections: {
                    active: 0,
                    peak: 0,
                    total: 0
                }
            },
            userExperience: {
                score: 100,
                factors: {
                    latency: 'good',
                    packetLoss: 'low',
                    disconnections: 'rare'
                }
            }
        };
        
        this.thresholds = {
            latency: {
                good: 50,      // < 50ms
                fair: 100,     // 50-100ms
                poor: 200,     // 100-200ms
                bad: 500       // > 200ms
            },
            throughput: {
                excellent: 1000,  // > 1000 ops/sec
                good: 500,       // 500-1000 ops/sec
                fair: 200,       // 200-500 ops/sec
                poor: 50         // < 200 ops/sec
            },
            errorRate: {
                acceptable: 0.01,  // < 1%
                warning: 0.05,      // 1-5%
                critical: 0.1       // > 5%
            },
            memoryUsage: {
                normal: 0.7,     // < 70%
                warning: 0.85,    // 70-85%
                critical: 0.95     // > 85%
            }
        };
        
        this.alerts = [];
        this.isMonitoring = false;
        this.monitoringInterval = null;
        this.reportInterval = null;
    }

    // Start performance monitoring
    startMonitoring() {
        console.log('📊 Starting performance monitoring...');
        this.isMonitoring = true;
        
        // Start real-time monitoring
        this.monitoringInterval = setInterval(() => {
            this.collectMetrics();
            this.evaluateThresholds();
            this.updateUserExperienceScore();
        }, 1000); // Update every second
        
        // Start periodic reporting
        this.reportInterval = setInterval(() => {
            this.generateReport();
        }, 60000); // Report every minute
        
        // Start memory monitoring
        this.startMemoryMonitoring();
        
        // Start connection monitoring
        this.startConnectionMonitoring();
    }

    // Stop performance monitoring
    stopMonitoring() {
        console.log('📊 Stopping performance monitoring...');
        this.isMonitoring = false;
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        if (this.reportInterval) {
            clearInterval(this.reportInterval);
            this.reportInterval = null;
        }
        
        this.generateFinalReport();
    }

    // Collect current metrics
    collectMetrics() {
        if (!this.isMonitoring) return;
        
        // Simulate metric collection (in real implementation, this would connect to actual systems)
        this.collectLatencyMetrics();
        this.collectThroughputMetrics();
        this.collectErrorMetrics();
        this.collectResourceMetrics();
    }

    // Collect latency metrics
    collectLatencyMetrics() {
        // Simulate latency measurement
        const currentLatency = this.simulateLatencyMeasurement();
        
        this.metrics.latency.samples.push(currentLatency);
        if (this.metrics.latency.samples.length > 100) {
            this.metrics.latency.samples.shift(); // Keep only last 100 samples
        }
        
        this.metrics.latency.current = currentLatency;
        this.metrics.latency.average = this.calculateAverage(this.metrics.latency.samples);
        this.metrics.latency.min = Math.min(...this.metrics.latency.samples);
        this.metrics.latency.max = Math.max(...this.metrics.latency.samples);
    }

    // Collect throughput metrics
    collectThroughputMetrics() {
        // Simulate throughput measurement
        const currentThroughput = this.simulateThroughputMeasurement();
        
        this.metrics.throughput.samples.push(currentThroughput);
        if (this.metrics.throughput.samples.length > 60) {
            this.metrics.throughput.samples.shift(); // Keep only last 60 samples (1 minute)
        }
        
        this.metrics.throughput.current = currentThroughput;
        this.metrics.throughput.average = this.calculateAverage(this.metrics.throughput.samples);
        this.metrics.throughput.peak = Math.max(...this.metrics.throughput.samples);
    }

    // Collect error metrics
    collectErrorMetrics() {
        // Simulate error collection
        const errorData = this.simulateErrorCollection();
        
        if (errorData) {
            this.metrics.errors.count++;
            this.metrics.errors.types[errorData.type] = (this.metrics.errors.types[errorData.type] || 0) + 1;
            this.metrics.errors.recent.push({
                timestamp: Date.now(),
                type: errorData.type,
                message: errorData.message,
                severity: errorData.severity
            });
            
            // Keep only last 50 errors
            if (this.metrics.errors.recent.length > 50) {
                this.metrics.errors.recent.shift();
            }
        }
        
        // Calculate error rate (errors per minute)
        const timeWindow = 60000; // 1 minute
        const recentErrors = this.metrics.errors.recent.filter(e => 
            Date.now() - e.timestamp < timeWindow
        );
        this.metrics.errors.rate = recentErrors.length / (timeWindow / 1000);
    }

    // Collect resource metrics
    collectResourceMetrics() {
        // Simulate resource monitoring
        const resourceData = this.simulateResourceCollection();
        
        this.metrics.resources.memory.used = resourceData.memory;
        this.metrics.resources.memory.peak = Math.max(
            this.metrics.resources.memory.peak, 
            resourceData.memory
        );
        
        this.metrics.resources.cpu.usage = resourceData.cpu;
        this.metrics.resources.connections.active = resourceData.connections;
        this.metrics.resources.connections.peak = Math.max(
            this.metrics.resources.connections.peak,
            resourceData.connections
        );
        this.metrics.resources.connections.total += resourceData.newConnections || 0;
    }

    // Evaluate metrics against thresholds
    evaluateThresholds() {
        this.evaluateLatencyThresholds();
        this.evaluateThroughputThresholds();
        this.evaluateErrorRateThresholds();
        this.evaluateResourceThresholds();
    }

    // Evaluate latency thresholds
    evaluateLatencyThresholds() {
        const latency = this.metrics.latency.current;
        let status = 'good';
        
        if (latency > this.thresholds.latency.bad) {
            status = 'bad';
            this.createAlert('critical', 'Latency too high', {
                current: latency,
                threshold: this.thresholds.latency.bad
            });
        } else if (latency > this.thresholds.latency.poor) {
            status = 'poor';
            this.createAlert('warning', 'High latency detected', {
                current: latency,
                threshold: this.thresholds.latency.poor
            });
        } else if (latency > this.thresholds.latency.fair) {
            status = 'fair';
        }
        
        this.metrics.userExperience.factors.latency = status;
    }

    // Evaluate throughput thresholds
    evaluateThroughputThresholds() {
        const throughput = this.metrics.throughput.current;
        let status = 'excellent';
        
        if (throughput < this.thresholds.throughput.poor) {
            status = 'poor';
            this.createAlert('critical', 'Low throughput detected', {
                current: throughput,
                threshold: this.thresholds.throughput.poor
            });
        } else if (throughput < this.thresholds.throughput.fair) {
            status = 'fair';
        } else if (throughput < this.thresholds.throughput.good) {
            status = 'good';
        }
        
        this.metrics.userExperience.factors.throughput = status;
    }

    // Evaluate error rate thresholds
    evaluateErrorRateThresholds() {
        const errorRate = this.metrics.errors.rate;
        let status = 'low';
        
        if (errorRate > this.thresholds.errorRate.critical) {
            status = 'high';
            this.createAlert('critical', 'High error rate detected', {
                current: errorRate,
                threshold: this.thresholds.errorRate.critical
            });
        } else if (errorRate > this.thresholds.errorRate.warning) {
            status = 'medium';
            this.createAlert('warning', 'Elevated error rate', {
                current: errorRate,
                threshold: this.thresholds.errorRate.warning
            });
        }
        
        this.metrics.userExperience.factors.packetLoss = status;
    }

    // Evaluate resource thresholds
    evaluateResourceThresholds() {
        const memoryUsage = this.metrics.resources.memory.used;
        const memoryThreshold = this.thresholds.memoryUsage;
        
        if (memoryUsage > memoryThreshold.critical) {
            this.createAlert('critical', 'Critical memory usage', {
                current: memoryUsage,
                threshold: memoryThreshold.critical
            });
            this.metrics.resources.memory.trend = 'increasing';
        } else if (memoryUsage > memoryThreshold.warning) {
            this.createAlert('warning', 'High memory usage', {
                current: memoryUsage,
                threshold: memoryThreshold.warning
            });
            this.metrics.resources.memory.trend = 'increasing';
        } else {
            this.metrics.resources.memory.trend = 'stable';
        }
    }

    // Update user experience score
    updateUserExperienceScore() {
        const factors = this.metrics.userExperience.factors;
        let score = 100;
        
        // Latency impact
        if (factors.latency === 'bad') score -= 30;
        else if (factors.latency === 'poor') score -= 15;
        else if (factors.latency === 'fair') score -= 5;
        
        // Throughput impact
        if (factors.throughput === 'poor') score -= 25;
        else if (factors.throughput === 'fair') score -= 10;
        else if (factors.throughput === 'good') score -= 2;
        
        // Error rate impact
        if (factors.packetLoss === 'high') score -= 20;
        else if (factors.packetLoss === 'medium') score -= 8;
        else if (factors.packetLoss === 'low') score -= 2;
        
        this.metrics.userExperience.score = Math.max(0, score);
        
        // Update disconnection factor based on recent errors
        const recentDisconnections = this.metrics.errors.recent.filter(e => 
            e.type === 'disconnection'
        ).length;
        
        if (recentDisconnections > 5) {
            this.metrics.userExperience.factors.disconnections = 'frequent';
        } else if (recentDisconnections > 2) {
            this.metrics.userExperience.factors.disconnections = 'occasional';
        } else {
            this.metrics.userExperience.factors.disconnections = 'rare';
        }
    }

    // Create alert
    createAlert(severity, message, data) {
        const alert = {
            id: Date.now(),
            timestamp: Date.now(),
            severity: severity,
            message: message,
            data: data,
            acknowledged: false
        };
        
        this.alerts.push(alert);
        
        // Keep only last 100 alerts
        if (this.alerts.length > 100) {
            this.alerts.shift();
        }
        
        // Log alert
        console.log(`🚨 [${severity.toUpperCase()}] ${message}`, data);
    }

    // Generate performance report
    generateReport() {
        const report = {
            timestamp: Date.now(),
            summary: this.generateSummary(),
            detailed: this.metrics,
            alerts: this.alerts.filter(a => !a.acknowledged),
            recommendations: this.generateRecommendations()
        };
        
        console.log('\n📊 PERFORMANCE MONITORING REPORT');
        console.log('='.repeat(50));
        console.log('SUMMARY:', report.summary);
        console.log('ACTIVE ALERTS:', report.alerts.length);
        console.log('RECOMMENDATIONS:', report.recommendations);
        
        return report;
    }

    // Generate summary statistics
    generateSummary() {
        return {
            userExperienceScore: this.metrics.userExperience.score,
            userExperienceLevel: this.getUserExperienceLevel(),
            averageLatency: this.metrics.latency.average.toFixed(2) + 'ms',
            peakLatency: this.metrics.latency.max + 'ms',
            averageThroughput: this.metrics.throughput.average.toFixed(2) + ' ops/sec',
            peakThroughput: this.metrics.throughput.peak + ' ops/sec',
            errorRate: (this.metrics.errors.rate * 100).toFixed(2) + '%',
            totalErrors: this.metrics.errors.count,
            activeConnections: this.metrics.resources.connections.active,
            memoryUsage: (this.metrics.resources.memory.used * 100).toFixed(1) + '%'
        };
    }

    // Get user experience level
    getUserExperienceLevel() {
        const score = this.metrics.userExperience.score;
        
        if (score >= 90) return 'excellent';
        if (score >= 75) return 'good';
        if (score >= 60) return 'fair';
        if (score >= 40) return 'poor';
        return 'bad';
    }

    // Generate recommendations
    generateRecommendations() {
        const recommendations = [];
        
        // Latency recommendations
        if (this.metrics.latency.average > this.thresholds.latency.fair) {
            recommendations.push({
                category: 'latency',
                priority: 'high',
                message: 'Consider optimizing network routing or reducing server load',
                impact: 'user experience'
            });
        }
        
        // Throughput recommendations
        if (this.metrics.throughput.average < this.thresholds.throughput.good) {
            recommendations.push({
                category: 'throughput',
                priority: 'medium',
                message: 'Consider scaling server capacity or optimizing database queries',
                impact: 'system capacity'
            });
        }
        
        // Error rate recommendations
        if (this.metrics.errors.rate > this.thresholds.errorRate.warning) {
            recommendations.push({
                category: 'errors',
                priority: 'critical',
                message: 'Investigate error sources and implement better error handling',
                impact: 'system stability'
            });
        }
        
        // Memory recommendations
        if (this.metrics.resources.memory.used > this.thresholds.memoryUsage.warning) {
            recommendations.push({
                category: 'memory',
                priority: 'high',
                message: 'Optimize memory usage or consider increasing server memory',
                impact: 'system resources'
            });
        }
        
        return recommendations;
    }

    // Generate final comprehensive report
    generateFinalReport() {
        const finalReport = {
            monitoringPeriod: 'Since monitoring started',
            totalMonitoringTime: this.calculateMonitoringDuration(),
            peakMetrics: this.calculatePeakMetrics(),
            trends: this.calculateTrends(),
            overallHealth: this.calculateOverallHealth(),
            actionableInsights: this.generateActionableInsights()
        };
        
        console.log('\n📊 FINAL PERFORMANCE REPORT');
        console.log('='.repeat(60));
        console.log('PEAK METRICS:', finalReport.peakMetrics);
        console.log('TRENDS:', finalReport.trends);
        console.log('OVERALL HEALTH:', finalReport.overallHealth);
        console.log('ACTIONABLE INSIGHTS:', finalReport.actionableInsights);
        
        return finalReport;
    }

    // Calculate monitoring duration
    calculateMonitoringDuration() {
        // This would be calculated from actual start time in real implementation
        return 'Monitoring session duration';
    }

    // Calculate peak metrics
    calculatePeakMetrics() {
        return {
            peakLatency: this.metrics.latency.max,
            peakThroughput: this.metrics.throughput.peak,
            peakConnections: this.metrics.resources.connections.peak,
            peakMemoryUsage: this.metrics.resources.memory.peak,
            peakErrorsPerMinute: Math.max(...this.alerts.filter(a => 
                a.timestamp > Date.now() - 60000
            ).map(a => 1).reduce((sum, count) => sum + count, 0))
        };
    }

    // Calculate trends
    calculateTrends() {
        return {
            latencyTrend: this.calculateTrend(this.metrics.latency.samples),
            throughputTrend: this.calculateTrend(this.metrics.throughput.samples),
            errorTrend: this.calculateTrend(this.metrics.errors.recent.map(e => 1)), // Convert to error counts
            memoryTrend: this.metrics.resources.memory.trend
        };
    }

    // Calculate overall health score
    calculateOverallHealth() {
        const healthScore = this.metrics.userExperience.score;
        
        if (healthScore >= 90) return 'excellent';
        if (healthScore >= 75) return 'good';
        if (healthScore >= 60) return 'fair';
        if (healthScore >= 40) return 'poor';
        return 'critical';
    }

    // Generate actionable insights
    generateActionableInsights() {
        const insights = [];
        
        // Performance insights
        if (this.metrics.latency.average > 150) {
            insights.push({
                type: 'performance',
                insight: 'High latency detected - investigate network bottlenecks',
                action: 'Run network diagnostics and consider CDN optimization'
            });
        }
        
        // Capacity insights
        if (this.metrics.resources.connections.active > this.metrics.resources.connections.peak * 0.8) {
            insights.push({
                type: 'capacity',
                insight: 'Approaching connection capacity limit',
                action: 'Consider scaling infrastructure or implementing connection pooling'
            });
        }
        
        // Error pattern insights
        const errorPatterns = this.analyzeErrorPatterns();
        if (errorPatterns.length > 0) {
            insights.push({
                type: 'reliability',
                insight: 'Recurring error patterns detected',
                action: 'Address root causes of recurring errors'
            });
        }
        
        return insights;
    }

    // Analyze error patterns
    analyzeErrorPatterns() {
        const patterns = [];
        const recentErrors = this.metrics.errors.recent;
        
        // Group errors by type
        const errorTypes = {};
        recentErrors.forEach(error => {
            errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
        });
        
        // Identify patterns
        for (const [type, count] of Object.entries(errorTypes)) {
            if (count > 5) {
                patterns.push({
                    type: type,
                    frequency: count,
                    pattern: 'recurring'
                });
            }
        }
        
        return patterns;
    }

    // Simulation methods (in real implementation, these would connect to actual systems)
    simulateLatencyMeasurement() {
        return Math.random() * 300 + 20; // 20-320ms
    }

    simulateThroughputMeasurement() {
        return Math.random() * 800 + 200; // 200-1000 ops/sec
    }

    simulateErrorCollection() {
        if (Math.random() < 0.05) { // 5% error rate
            return {
                type: ['timeout', 'network', 'validation', 'disconnection'][Math.floor(Math.random() * 4)],
                message: 'Simulated error for testing',
                severity: ['warning', 'error', 'critical'][Math.floor(Math.random() * 3)]
            };
        }
        return null;
    }

    simulateResourceCollection() {
        return {
            memory: Math.random() * 0.8 + 0.1, // 10-90%
            cpu: Math.random() * 0.7 + 0.2, // 20-90%
            connections: Math.floor(Math.random() * 50) + 10, // 10-60
            newConnections: Math.random() < 0.1 ? 1 : 0 // 10% chance of new connection
        };
    }

    // Utility methods
    calculateAverage(samples) {
        if (samples.length === 0) return 0;
        return samples.reduce((sum, sample) => sum + sample, 0) / samples.length;
    }

    calculateTrend(samples) {
        if (samples.length < 2) return 'stable';
        
        const firstHalf = samples.slice(0, Math.floor(samples.length / 2));
        const secondHalf = samples.slice(Math.floor(samples.length / 2));
        
        const firstAvg = this.calculateAverage(firstHalf);
        const secondAvg = this.calculateAverage(secondHalf);
        
        if (secondAvg > firstAvg * 1.1) return 'increasing';
        if (secondAvg < firstAvg * 0.9) return 'decreasing';
        return 'stable';
    }

    // Memory monitoring
    startMemoryMonitoring() {
        if (performance.memory) {
            setInterval(() => {
                const memoryInfo = performance.memory;
                if (memoryInfo) {
                    this.metrics.resources.memory.used = memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize;
                }
            }, 5000); // Check every 5 seconds
        }
    }

    // Connection monitoring
    startConnectionMonitoring() {
        // Monitor connection status changes
        this.monitorConnectionChanges();
    }

    monitorConnectionChanges() {
        // This would integrate with WebSocket status monitoring
        // Implementation depends on the specific WebSocket library used
    }

    // Export metrics for external access
    getMetrics() {
        return {
            ...this.metrics,
            alerts: this.alerts,
            thresholds: this.thresholds,
            isMonitoring: this.isMonitoring
        };
    }

    // Acknowledge alert
    acknowledgeAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
        }
    }

    // Clear alerts
    clearAlerts() {
        this.alerts = [];
    }
}

// Export for global use
window.PerformanceMonitoringSystem = PerformanceMonitoringSystem;
