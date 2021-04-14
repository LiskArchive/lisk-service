@Library('lisk-jenkins') _

LISK_CORE_PORT = 4000
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
					runServiceIfMissing('Lisk Core', './docker/lisk-core-jenkins', LISK_CORE_PORT)
					runServiceIfMissing('MySQL', './docker/mysql', MYSQL_PORT)
					runServiceIfMissing('Redis', './docker/redis', REDIS_PORT)
				}
			}
		}
	}
	post {
		// failure {
		// }
		cleanup {
			echo 'Cleaning up...'
			// dir('./docker/lisk-core-jenkins') { sh "make down" }
			// dir('./docker/mysql') { sh "make down" }
			// dir('./docker/redis') { sh "make down" }
		}
	}
}
// vim: filetype=groovy
