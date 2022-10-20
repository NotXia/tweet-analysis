pipeline {
    agent any

    stages {
        stage('SCM') { 
            steps {
                checkout scm
            }
        }

        stage("Test") {
            agent {
                docker {
                    image 'node:16'
                }
            }
            stages("Test") {
                stage('Installing dependencies') {
                    steps {
                        updateGitlabCommitStatus name: 'Installing test dependencies', state: 'pending'
                        sh 'npm install'
                    }
                    post {
                        success {
                            updateGitlabCommitStatus name: 'Installing test dependencies', state: 'success'
                        }
                        failure {
                            updateGitlabCommitStatus name: 'Installing test dependencies', state: 'failed'
                        }
                    } 
                }
                stage('Unit test') { 
                    steps {
                        updateGitlabCommitStatus name: 'Unit test', state: 'pending'
                        sh 'npm run test:unit' 
                    }
                    post {
                        success {
                            updateGitlabCommitStatus name: 'Unit test', state: 'success'
                        }
                        failure {
                            updateGitlabCommitStatus name: 'Unit test', state: 'failed'
                        }
                    } 
                }
            }
		}

        stage('SonarQube analysis') {
            when {
                expression {
                    return env.GIT_BRANCH == "origin/dev";
                }
            }
            steps {
                updateGitlabCommitStatus name: 'SonarScanner analysis', state: 'pending'
                script {
                    def scannerHome = tool 'SonarScanner';
                    withSonarQubeEnv() {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
            post {
                success {
				    updateGitlabCommitStatus name: 'SonarScanner analysis', state: 'success'
                }
                failure {
				    updateGitlabCommitStatus name: 'SonarScanner analysis', state: 'failed'
                }
            }
        }
 
        stage ("Production deploy") {
            when {
                expression {
                    return env.GIT_BRANCH == "origin/main";
                }
            }
            steps {
                updateGitlabCommitStatus name: 'Production deploy', state: 'pending'
                sshagent(credentials : [ "adeab2ae-7d1c-4cee-aaaa-a958b80846d4" ]) {
                    sh "ssh -o StrictHostKeyChecking=no jenkins@tcxia.ddns.net '~/deploy-prod.sh'"
                }
            }
            post {
                success {
                    updateGitlabCommitStatus name: 'Production deploy', state: 'success'
                }
                failure {
                    updateGitlabCommitStatus name: 'Production deploy', state: 'failed'
                }
            } 
        }

        stage ("Development deploy") {
            when {
                expression {
                    return env.GIT_BRANCH == "origin/dev";
                }
            }
            steps {
                updateGitlabCommitStatus name: 'Development deploy', state: 'pending'
                sshagent(credentials : [ "adeab2ae-7d1c-4cee-aaaa-a958b80846d4" ]) {
                    sh "ssh -o StrictHostKeyChecking=no jenkins@tcxia.ddns.net '~/deploy-dev.sh'"
                }
            }
            post {
                success {
                    updateGitlabCommitStatus name: 'Development deploy', state: 'success'
                }
                failure {
                    updateGitlabCommitStatus name: 'Development deploy', state: 'failed'
                }
            } 
        }
    }
}