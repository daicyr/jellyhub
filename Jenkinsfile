// push sur develop run juste la ci (lint, fmt, build, tests)
// push sur pr dev -> main, run ci + cd en preprod
// push / merge dans main, ci/cd complete + deploy en prod

pipeline {
    agent any

    environment {
        BUN_INSTALL = "${WORKSPACE}/.bun"
        PATH = "${WORKSPACE}/.bun/bin:${env.PATH}"
        APP_NAME = "jellyhub-app"
        DOCKER_USER = "daicyr"
        TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup NodeJs') {
            steps {
                sh 'echo "Node is located at: $(which node)"'
                sh """
                    if command -v node &> /dev/null; then
                        echo 'NodeJs already installed. Skipping installation.'
                    else
                        echo 'Installing NodeJs...'
                        curl -fsSL https://raw.githubusercontent.com/mklement0/n-install/stable/bin/n-install | bash -s 26
                    fi
                """
            }
        }

        stage('Setup Bun') {
            steps {
                sh """
                    if command -v bun &> /dev/null; then
                        echo 'Bun already installed. Skipping installation.'
                    else
                        echo 'Installing Bun...'
                        curl -fsSL https://bun.sh/install | bash -s 'bun-v1.1.34'
                    fi
                    bun --version
                """
            }
        }
        stage('Install dependencies') {
            steps {
                sh 'bun install --frozen-lockfile'
            }
        }
        stage('Lint') {
            steps {
                sh 'bun run lint'
            }
        }
        stage('Fmt') {
            steps {
                sh 'bun run fmt:check'
            }
        }
        stage('Units Tests') {
            steps {
                sh 'bun run test'
            }
        }

        /***********/
        /* Staging */
        /***********/
        stage('Staging - Build Image') {
            when {
                branch 'staging'
            }
            steps {
                withCredentials([file(credentialsId: 'jellyhub_STAGING_ENV', variable: 'ENV_FILE')]) {
                    sh '''
                        cp $ENV_FILE ${WORKSPACE}/.env
                        docker compose build
                        docker tag ${APP_NAME} staging-${DOCKER_USER}/${APP_NAME}:${TAG}
                        docker tag ${APP_NAME} staging-${DOCKER_USER}/${APP_NAME}:latest
                        docker image rm ${APP_NAME}:latest
                    '''
                }
            }
        }
        stage('Staging - Analyze Image') {
            when {
                branch 'staging'
            }
            steps {
                // analyze docker image with trivy scan
                echo 'analyze docker image with trivy scan'
            }
        }
        stage('Staging - Push image to ghcr.io') {
            when {
                branch 'staging'
            }
            environment {
                registryCredential = 'docker-hub-auth'
            }
            steps {
                echo 'push image to github container registry'
                script {
                    docker.withRegistry("https://registry.hub.docker.com", registryCredential) {
                        docker.image("${DOCKER_USER}/staging-${APP_NAME}:${TAG}").push()
                        docker.image("${DOCKER_USER}/staging-${APP_NAME}:latest").push()
                    }
                }
                sh """
                    docker image rm ${DOCKER_USER}/staging-${APP_NAME}:${TAG}
                    docker image rm ${DOCKER_USER}/staging-${APP_NAME}:latest
                """
            }
        }

        /**************/
        /* Production */
        /**************/
        stage('Production - Build Image') {
            when {
                branch 'production'
            }
            steps {
                // build docker image
                echo 'build docker image'
            }
        }
        stage('Production - Analyze Image') {
            when {
                branch 'production'
            }
            steps {
                // analyze docker image with trivy scan
                echo 'analyze docker image with trivy scan'
            }
        }
        stage('Production - Push image to ghcr.io') {
            when {
                branch 'production'
            }
            steps {
                // push image to github container registry
                echo 'push image to github container registry'
            }
        }
    }
    post {
        success {
            echo 'Pipeline succeed'
        }
        failure {
            echo 'Pipeline failed'
        }
    }
}
