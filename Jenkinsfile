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
		stage ('Build deps') {
			steps {
				nvm(getNodejsVersion()) {
					dir('./') { sh 'npm ci' }
					dir('./framework') { sh 'npm ci' }
					dir('./services/core') { sh 'npm ci' }
					dir('./services/gateway') { sh 'npm ci' }
					dir('./services/template') { sh 'npm ci' }
					dir('./tests') { sh "npm ci" }
				}
			}
		}

		stage ('Check linting') {
			steps {
				nvm(getNodejsVersion()) {
					sh 'npm run eslint'
				}
			}
		}

		stage('Run framework unit tests') {
			steps {
				nvm(getNodejsVersion()) {
					dir('./framework') {
						sh "npm run test:unit"
					}
				}
			}
		}

		stage('Build docker images') {
			steps {
				sh 'make build-core'
				sh 'make build-gateway'
				sh 'make build-template'
			}
		}

		stage('Run microservices') {
			steps {
				ansiColor('xterm') {
					dir('./docker') { sh "make -f ${Makefile} up" }
				}
			}
		}

		stage('Check API gateway status') {
			steps {
				waitForHttp()
				// sleep(1)
			}
		}

		stage('Run functional tests') {
			steps {
				ansiColor('xterm') {
					dir('./docker') { sh "make -f ${Makefile} test-functional" }
				}
			}
		}

		// stage('Run integration tests') {
		// 	steps {
		// 		dir('./docker') { sh "make -f ${Makefile} test-integration" }
		// 	}
		// }
	}
	post {
		failure {
			// dir('./docker') { sh "make -f ${Makefile} logs" }
			dir('./docker') { sh "make -f ${Makefile} logs-template" }
			dir('./docker') { sh "make -f ${Makefile} logs-gateway" }
			dir('./docker') { sh "make -f ${Makefile} logs-core" }
		}
		cleanup {
			dir('./docker') { sh "make -f ${Makefile} mrproper" }
		}
	}
}
// vim: filetype=groovy
