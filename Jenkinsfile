pipeline {
    agent any
    
    // Environment variables
    environment {
        NODE_VERSION = '18'  // Node.js version required
        PLAYWRIGHT_BROWSERS_PATH = "${WORKSPACE}/.playwright"
        // Add any other environment variables from your config
    }
    
    // Build parameters for flexibility
    parameters {
        choice(name: 'TEST_SUITE', choices: ['all', 'auth', 'products', 'brands', 'users'], description: 'Select test suite to run')
        booleanParam(name: 'RUN_HEADED', defaultValue: false, description: 'Run tests in headed mode')
        booleanParam(name: 'UPDATE_SNAPSHOTS', defaultValue: false, description: 'Update snapshots')
        string(name: 'WORKERS', defaultValue: '4', description: 'Number of parallel workers')
    }
    
    options {
        // Keep only last 10 builds
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // Timeout after 30 minutes
        timeout(time: 30, unit: 'MINUTES')
        // Add timestamps to console output
        timestamps()
        // Disable concurrent builds
        disableConcurrentBuilds()
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "🔍 Checking out code..."
                    checkout scm
                }
            }
        }
        
        stage('Setup Node.js') {
            steps {
                script {
                    echo "📦 Setting up Node.js ${NODE_VERSION}..."
                    // Using NodeJS plugin - configure in Jenkins Global Tool Configuration
                    nodejs(nodeJSInstallationName: "NodeJS ${NODE_VERSION}") {
                        bat 'node --version'
                        bat 'npm --version'
                    }
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    echo "📥 Installing npm dependencies..."
                    nodejs(nodeJSInstallationName: "NodeJS ${NODE_VERSION}") {
                        bat 'npm ci'  // Use ci for faster, reliable installs in CI environments
                    }
                }
            }
        }
        
        stage('Install Playwright Browsers') {
            steps {
                script {
                    echo "🌐 Installing Playwright browsers..."
                    nodejs(nodeJSInstallationName: "NodeJS ${NODE_VERSION}") {
                        bat 'npx playwright install --with-deps'
                    }
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                script {
                    echo "🧪 Running Playwright tests..."
                    
                    def testCommand = 'npx playwright test'
                    
                    // Add test suite selection
                    if (params.TEST_SUITE != 'all') {
                        testCommand += " tests/api/${params.TEST_SUITE}/"
                    }
                    
                    // Add headed mode if selected
                    if (params.RUN_HEADED) {
                        testCommand += ' --headed'
                    }
                    
                    // Add workers configuration
                    testCommand += " --workers=${params.WORKERS}"
                    
                    // Add update snapshots if selected
                    if (params.UPDATE_SNAPSHOTS) {
                        testCommand += ' --update-snapshots'
                    }
                    
                    // Add reporter for CI
                    testCommand += ' --reporter=list,html,json'
                    
                    echo "Executing: ${testCommand}"
                    
                    nodejs(nodeJSInstallationName: "NodeJS ${NODE_VERSION}") {
                        // Use returnStatus to prevent build failure on test failures
                        def testResult = bat(script: testCommand, returnStatus: true)
                        
                        // Store test result but continue to publish reports
                        if (testResult != 0) {
                            currentBuild.result = 'UNSTABLE'
                            echo "⚠️ Some tests failed. Check the reports for details."
                        } else {
                            echo "✅ All tests passed successfully!"
                        }
                    }
                }
            }
        }
        
        stage('Generate Reports') {
            steps {
                script {
                    echo "📊 Generating test reports..."
                    nodejs(nodeJSInstallationName: "NodeJS ${NODE_VERSION}") {
                        // Generate HTML report
                        bat 'npx playwright show-report --host 127.0.0.1'
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo "📝 Publishing test results and artifacts..."
            
            // Archive test results
            archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true, fingerprint: true
            archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
            archiveArtifacts artifacts: 'logs/**/*', allowEmptyArchive: true
            
            // Publish HTML Report
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Test Report',
                reportTitles: 'Playwright API Test Results'
            ])
            
            // Clean workspace if needed
            cleanWs(
                cleanWhenNotBuilt: false,
                deleteDirs: true,
                disableDeferredWipeout: true,
                notFailBuild: true,
                patterns: [
                    [pattern: 'node_modules/', type: 'INCLUDE'],
                    [pattern: '.playwright/', type: 'INCLUDE'],
                    [pattern: 'test-results/', type: 'INCLUDE']
                ]
            )
        }
        
        success {
            echo "✅ Pipeline completed successfully!"
            // Add notifications here (email, Slack, etc.)
        }
        
        failure {
            echo "❌ Pipeline failed!"
            // Add failure notifications here
        }
        
        unstable {
            echo "⚠️ Pipeline completed with test failures!"
            // Add unstable notifications here
        }
    }
}
