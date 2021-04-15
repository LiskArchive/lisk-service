@Library('lisk-jenkins') _

LISK_CORE_HTTP_PORT = 4000
LISK_CORE_WS_PORT = 5001
MYSQL_PORT = 3306
REDIS_PORT = 6379

def checkOpenPort(nPort) {
	def result = sh script: "nc -z localhost ${nPort}", returnStatus: true
	return (result == 0)
}

def runServiceIfMissing(svcName, path, nPort) {
	if (checkOpenPort(nPort) == false) {
		echo "${svcName} is not running, starting a new instance on port ${nPort}"
		dir(path) { sh "make up" }
		if (checkOpenPort(nPort) == false) { 
			dir(path) { sh "make logs" }
			currentBuild.result = "FAILURE"
			throw new Exception("Failed to run ${svcName} instance")
		}
	}
}

pipeline {
	agent { node { label 'lisk-service' } }
	options {
		timeout(time: 8, unit: 'MINUTES')
	}
	environment {
		ENABLE_HTTP_API='http-version1,http-version1-compat,http-status,http-test,http-version2'
		ENABLE_WS_API='rpc,rpc-v1,blockchain,rpc-test,rpc-v2'
	}
	stages {
		stage ('Run required services') {
			steps {
				script {
					runServiceIfMissing('Lisk Core', './docker/lisk-core-jenkins', LISK_CORE_WS_PORT)
					runServiceIfMissing('MySQL', './docker/mysql', MYSQL_PORT)
					runServiceIfMissing('Redis', './docker/redis', REDIS_PORT)

					// Install PM2
					nvm(getNodejsVersion()) {
						sh 'npm i -g pm2'
					}
				}
			}
		}
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
		stage('Run microservices') {
			steps {
				ansiColor('xterm') {
					nvm(getNodejsVersion()) {
						sh 'pm2 start ecosystem.jenkins.config.js'
					}
					dir('./docker') { sh "ENABLE_HTTP_API=${ENABLE_HTTP_API} ENABLE_WS_API=${ENABLE_WS_API} make -f ${Makefile} up" }
				}
			}
		}
	}
	post {
		// failure {
		// }
		cleanup {
			echo 'Cleaning up...'

			nvm(getNodejsVersion()) {
				sh 'pm2 stop ecosystem.jenkins.config.js'
			}

			dir('./docker/lisk-core-jenkins') { sh "make down" }
			// dir('./docker/mysql') { sh "make down" }
			// dir('./docker/redis') { sh "make down" }
		}
	}
}
// vim: filetype=groovy
