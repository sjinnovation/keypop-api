pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        SERVER_IP = "13.213.162.98"
        SERVER_USER = "apcome-be"
        APP_DIR = "/home/apcome-be/"
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/sjinnovation/keypop-api.git',
                        credentialsId: 'Github Sid'
                    ]]
                ])
            }
        }

        stage('Deploy Code to Server') {
            steps {
                sshagent(credentials: ['apcom-be-prod']) {
                    sh '''
                        rsync -az \
                          -e "ssh -p 22 -o StrictHostKeyChecking=no" \
                          --exclude=node_modules \
                          --exclude=.git \
                          ./ ${SERVER_USER}@${SERVER_IP}:${APP_DIR}
                    '''
                }
            }
        }

        stage('Install, Build & Restart App') {
            steps {
                sshagent(credentials: ['apcom-be-prod']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no -p 22 ${SERVER_USER}@${SERVER_IP} "
                            set -e
                            cd /home/apcome-be/

                            echo '📦 Installing dependencies...'
                            npm install

                            echo '🔄 Restarting app safely...'
                            pm2 restart all || npm run pm2-start

                            pm2 save

                            echo '✅ Deployment completed successfully'
                        "
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ Apcom FE deployed successfully (safe incremental deploy)"
        }
        failure {
            echo "❌ Apcom FE deployment failed..."
        }
    }
}
