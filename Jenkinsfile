@Library('lisk-jenkins') _

LISK_CORE_PORT = 4000
MYSQL_PORT = 3306
REDIS_PORT = 6379

def checkOpenPort(nPort) {
	def result = sh script: "nc -z localhost ${nPort}", returnStatus: true
	return (result == 0)
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
		stage ('Build deps') {
			steps {
				script {
					if (checkOpenPort(LISK_CORE_PORT) == false) {
						echo "Lisk Core is not running, starting a new instance on port ${LISK_CORE_PORT}"
						dir('./docker/lisk-core-jenkins') { sh "make up" }
					}
					if (checkOpenPort(MYSQL_PORT) == false) {
						echo "MySQL is not running, starting a new instance on port ${MYSQL_PORT}"
						dir('./docker/mysql') { sh "make up" }
					}
					if (checkOpenPort(REDIS_PORT) == false) {
						echo 'Redis is not running, starting a new instance on port ${REDIS_PORT}'
						dir('./docker/redis') { sh "make up" }
					}
				}
			}
		}
	}
	post {
		// failure {
		// }
		cleanup {
			dir('./docker/lisk-core-jenkins') { sh "make down" }
			dir('./docker/mysql') { sh "make down" }
			dir('./docker/redis') { sh "make down" }

			// Cleanup unused containers
			// sh 'docker rmi $(docker images | grep "^<none>" | awk \'{print $3}\')'
		}
	}
}
// vim: filetype=groovy
