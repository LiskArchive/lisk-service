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
	environment {
		LISK_APP_DATA_PATH='~/.lisk/lisk-core'
    }
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
		stage('Build Core') {
			steps {
				dir('lisk-core') {
					nvm(readFile(".nvmrc").trim()) {
						sh '''
						npm install --registry https://npm.lisk.com/
						npm install --global yarn
						for package in $( cat ../packages ); do
						  yarn link "$package"
						done
						npm run build
						echo $! >lisk-core.pid
						'''
					}
				}
			}
		}
		stage ('Build deps') {
			steps {
				dir('lisk-service') {
					script { echoBanner(STAGE_NAME) }
					nvm(getNodejsVersion()) {
						dir('./') { sh 'npm i' }
						dir('./framework') { sh 'npm i' }
						dir('./services/blockchain-connector') { sh 'npm i' }
						dir('./services/blockchain-indexer') { sh 'npm i' }
						dir('./services/blockchain-coordinator') { sh 'npm i' }
						dir('./services/core') { sh 'npm i' }
						dir('./services/fee-estimator') { sh 'npm i' }
						dir('./services/market') { sh 'npm i' }
						dir('./services/newsfeed') { sh 'npm i' }
						dir('./services/export') { sh 'npm i' }
						dir('./services/gateway') { sh 'npm i' }
						dir('./services/template') { sh 'npm i' }
						dir('./services/transaction-statistics') { sh 'npm i' }
						dir('./tests') { sh 'npm i' }
					}
				}
			}
		}
		stage ('Check linting') {
			steps {
				script { echoBanner(STAGE_NAME) }
				nvm(getNodejsVersion()) {
					sh 'npm run eslint'
				}
			}
		}
		stage('Perform unit tests') {
			steps {
				script { echoBanner(STAGE_NAME) }
				nvm(getNodejsVersion()) {
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
		stage('Run microservices') {
			steps {
				script { echoBanner(STAGE_NAME) }
				nvm(getNodejsVersion()) {
					sh 'pm2 start --silent ecosystem.jenkins.config.js' 
				}
				waitForHttp('http://localhost:9901/api/v3/blocks')
			}
		}
	}
	post {
		failure {
			script { echoBanner('Failed to run the pipeline') }
		}
		cleanup {
			script { echoBanner('Cleaning up...') }
			echo 'Keeping dependencies for the next build'
			dir('lisk-service') { sh 'make clean' }
			sh '''
			# lisk-core
			kill -9 $( cat lisk-core.pid ) || true
			'''
		}
	}
}
// vim: filetype=groovy
