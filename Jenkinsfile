@Library('lisk-jenkins') _

def echoBanner(msg) {
	echo '----------------------------------------------------------------------'
	echo msg
	echo '----------------------------------------------------------------------'
}

pipeline {
	agent { node { label 'lisk-service' } }
	options {
		timeout(time: 10, unit: 'MINUTES')
	}
	stages {
		stage ('Build deps') {
			steps {
				script { echoBanner(STAGE_NAME) }
				nvm(getNodejsVersion()) {
					dir('./') { sh 'npm i' }
					dir('./framework') { sh 'npm i' }
					dir('./services/blockchain-connector') { sh 'npm i' }
					dir('./services/core') { sh 'npm i' }
					dir('./services/market') { sh 'npm i' }
					dir('./services/newsfeed') { sh 'npm i' }
					dir('./services/export') { sh 'npm i' }
					dir('./services/gateway') { sh 'npm i' }
					dir('./services/template') { sh 'npm i' }
					dir('./tests') { sh 'npm i' }
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
					dir('./services/core') { sh "npm run test:unit" }
					dir('./services/market') { sh "npm run test:unit" }
					dir('./services/newsfeed') { sh "npm run test:unit" }
					dir('./services/export') { sh "npm run test:unit" }
				}
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
		}
	}
}
// vim: filetype=groovy
