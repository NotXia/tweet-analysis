pipeline {
    agent any
    tools {nodejs "node-16"}

    stages {
        stage("SCM") { 
            steps {
                checkout scm
            }
        }

        stage("Test") {
            environment {
                TWITTER_BEARER_TOKEN = credentials("c96b2e95-956e-467e-9d86-d1793f9a0c18")
            }

            stages {
                stage("Installing dependencies") {
                    steps {
                        sh "npm install"
                    }
                    post {
                        failure { updateGitlabCommitStatus name: "Installing test dependencies", state: "failed" }
                    } 
                }
                stage("Unit tests") { 
                    steps {
                        updateGitlabCommitStatus name: "Unit test", state: "pending"
                        sh "npm run test:unit" 
                    }
                    post {
                        success { updateGitlabCommitStatus name: "Unit test", state: "success" }
                        failure { updateGitlabCommitStatus name: "Unit test", state: "failed" }
                    } 
                }
                stage("API tests") { 
                    steps {
                        updateGitlabCommitStatus name: "API test", state: "pending"
                        sh "npm run test:api" 
                    }
                    post {
                        success { updateGitlabCommitStatus name: "API test", state: "success" }
                        failure { updateGitlabCommitStatus name: "API test", state: "failed" }
                    } 
                }
            }
        }

        stage("SonarQube analysis") {
            when {
                expression {
                    return env.GIT_BRANCH == "origin/dev";
                }
            }
            steps {
                updateGitlabCommitStatus name: "SonarScanner analysis", state: "pending"
                script {
                    def scannerHome = tool "SonarScanner";
                    withSonarQubeEnv() {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
            post {
                success { updateGitlabCommitStatus name: "SonarScanner analysis", state: "success" }
                failure { updateGitlabCommitStatus name: "SonarScanner analysis", state: "failed" }
            }
        }

        stage ("Production deploy") {
            when {
                expression {
                    return env.GIT_BRANCH == "origin/main";
                }
            }
            steps {
                updateGitlabCommitStatus name: "Production deploy", state: "pending"
                sshagent(credentials : [ "adeab2ae-7d1c-4cee-aaaa-a958b80846d4" ]) {
                    sh "ssh -o StrictHostKeyChecking=no jenkins@tcxia.ddns.net '~/deploy-prod.sh'"
                }
            }
            post {
                success { updateGitlabCommitStatus name: "Production deploy", state: "success" }
                failure { updateGitlabCommitStatus name: "Production deploy", state: "failed" }
            } 
        }

        stage ("Development deploy") {
            when {
                expression {
                    return env.GIT_BRANCH == "origin/dev";
                }
            }
            steps {
                updateGitlabCommitStatus name: "Development deploy", state: "pending"
                sshagent(credentials : [ "adeab2ae-7d1c-4cee-aaaa-a958b80846d4" ]) {
                    sh "ssh -o StrictHostKeyChecking=no jenkins@tcxia.ddns.net '~/deploy-dev.sh'"
                }
            }
            post {
                success { updateGitlabCommitStatus name: "Development deploy", state: "success" }
                failure { updateGitlabCommitStatus name: "Development deploy", state: "failed" }
            } 
        }
    }
}