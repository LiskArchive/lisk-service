@Library('lisk-jenkins') _

def echoBanner(msg) {
	echo '----------------------------------------------------------------------'
	echo msg
	echo '----------------------------------------------------------------------'
}

properties([
	parameters([
		string(name: 'COMMITISH_CORE', description: 'Commit-ish of LiskHQ/lisk-core to use', defaultValue: 'development' ),
	])
])

pipeline {
	agent { node { label 'lisk-service' } }
	options {
		timeout(time: 10, unit: 'MINUTES')
	}
	stages {
		stage('Checkout SCM') {
			steps {
				cleanWs()
				dir('lisk-core') {
					checkout([$class: 'GitSCM', branches: [[name: "${params.COMMITISH_CORE}" ]], userRemoteConfigs: [[url: 'https://github.com/LiskHQ/lisk-core']]])
				}
				dir('lisk-service') {
					checkout scm
				}
			}
		}
		stage ('Build dependencies') {
			steps {
				dir('lisk-core') {
					nvm(readFile(".nvmrc").trim()) {
						sh '''
							rm -rf ~/.lisk
							npm ci
							npm run build
						'''
					}
				}
				dir('lisk-service') {
					script { echoBanner(STAGE_NAME) }
					nvm(readFile(".nvmrc").trim()) {
						dir('./') { sh 'npm ci' }
						dir('./framework') { sh 'npm ci' }
						dir('./services/blockchain-connector') { sh 'npm ci' }
						dir('./services/blockchain-indexer') { sh 'npm ci' }
						dir('./services/blockchain-coordinator') { sh 'npm ci' }
						dir('./services/core') { sh 'npm ci' }
						dir('./services/fee-estimator') { sh 'npm ci' }
						dir('./services/market') { sh 'npm ci' }
						dir('./services/newsfeed') { sh 'npm ci' }
						dir('./services/export') { sh 'npm ci' }
						dir('./services/gateway') { sh 'npm ci' }
						dir('./services/template') { sh 'npm ci' }
						dir('./services/transaction-statistics') { sh 'npm ci' }
						dir('./tests') { sh 'npm ci' }
					}
				}
			}
		}
		stage('Start dependencies') {
			steps {
				script { echoBanner('Starting Lisk Core') }
				dir('lisk-core') {
					nvm(readFile(".nvmrc").trim()) {
						sh '''
							./bin/run start --network devnet --api-ipc &
							echo $! > lisk-core.pid
						'''
					}
				}
			}
		}
		stage ('Check linting') {
			steps {
				dir('lisk-service') {
					script { echoBanner(STAGE_NAME) }
					nvm(readFile(".nvmrc").trim()) {
						sh 'npm run eslint'
					}
				}
			}
		}
		stage('Perform unit tests') {
			steps {
				dir('lisk-service') {
					script { echoBanner(STAGE_NAME) }
					nvm(readFile(".nvmrc").trim()) {
						dir('./framework') { sh "npm run test:unit" }
						dir('./services/blockchain-connector') { sh "npm run test:unit" }
						dir('./services/blockchain-indexer') { sh "npm run test:unit" }
						dir('./services/fee-estimator') { sh "npm run test:unit" }
						dir('./services/core') { sh "npm run test:unit" }
						dir('./services/market') { sh "npm run test:unit" }
						dir('./services/newsfeed') { sh "npm run test:unit" }
						dir('./services/export') { sh "npm run test:unit" }
					}
				}
			}
		}
		stage('Run microservices') {
			steps {
				dir('lisk-service') {
					script { echoBanner(STAGE_NAME) }
					nvm(readFile(".nvmrc").trim()) {
						sh '''
							npm install --global pm2
							pm2 start --silent ecosystem.jenkins.config.js
						''' 
					}
					waitForHttp('http://localhost:9901/api/v3/blocks')
				}
			}
		}
	}
	post {
		failure {
			script { echoBanner('Failed to run the pipeline') }
			sh '''
				pm2 logs lisk-service-blockchain-connector
			'''	
		}
		cleanup {
			script { echoBanner('Cleaning up...') }
			dir('lisk-service') { sh 'make clean-local' }
			sh '''
				# lisk-core
				kill $( cat lisk-core.pid ) || true
				rm -rf ~/.lisk
			'''
		}
	}
}
// vim: filetype=groovy
