@Library('lisk-jenkins') _

Makefile = 'Makefile.jenkins'

def waitForHttp() {
	timeout(1) {
		waitUntil {
			script {
				dir('./docker') {
					def api_available = sh script: "make -f ${Makefile} ready", returnStatus: true
					return (api_available == 0)
				}
			}
		}
	}
}

pipeline {
	agent { node { label 'lisk-service' } }
	stages {
		stage ('Check linting') {
			steps {
				nvm(getNodejsVersion()) {
					sh 'npm ci && npm run eslint'
				}
			}
		}

		stage('Run framework unit tests') {
			steps {
				nvm(getNodejsVersion()) {
					dir('./framework') {
						sh "npm ci && npm run test:unit"
					}
				}
			}
		}

		stage('Build docker images') {
			steps {
				nvm(getNodejsVersion()) {
					sh 'npm run docker:build:core'
					sh 'npm run docker:build:gateway'
					sh 'npm run docker:build:template'
				}
			}
		}

		stage('Run microservices') {
			steps {
				ansiColor('xterm') {
					// Run Lisk Core & Lisk Service
					dir('./docker') { sh "make -f ${Makefile} up" }
				}
			}
		}

		stage('Check API gateway status') {
			steps {
				// Wait for the API to spin up
				// waitForHttp()
				sleep(1)
			}
		}

		stage('Run functional tests') {
			steps {
				nvm(getNodejsVersion()) {
					dir('./tests') { sh "npm ci && npm run test:functional" }
				}
			}
		}

		// stage('Run integration tests') {
		// 	steps {
		// 		dir('./docker') { sh "make -f ${Makefile} test" }
		// 	}
		// }
	}
	post {
		// failure {
		// }
		cleanup {
			dir('./docker') { sh "make -f ${Makefile} mrproper" }
		}
	}
}
// vim: filetype=groovy
