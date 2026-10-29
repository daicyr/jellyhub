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

        stage('Setup Bun') {
            steps {
                sh """
                    curl -fsSL https://bun.sh/install | bash
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
        stage('Staging - Build Docker image') {
            when {
                branch 'staging'
            }
            steps {
                sh """
                    docker build -t staging-${APP_NAME} .
                    docker tag staging-${APP_NAME} ${DOCKER_USER}/staging-${APP_NAME}:${TAG}
                    docker tag staging-${APP_NAME} ${DOCKER_USER}/staging-${APP_NAME}:latest
                """
            }
        }
        stage('Staging - Analyze Image') {
            when {
                branch 'staging'
            }
            steps {
                sh """
                    docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        -v trivy-cache:/root/.cache/ \
                        aquasec/trivy:latest image \
                            --severity HIGH,CRITICAL \
                            --exit-code 1 \
                            staging-${APP_NAME}
                """
            }
        }
        stage('Staging - Push Docker image to DockerHub') {
            when {
                branch 'staging'
            }
            environment {
                registryCredential = 'DOCKER_HUB_CREDENTIALS'
            }
            steps {
                script {
                    docker.withRegistry("https://registry.hub.docker.com", registryCredential) {
                        docker.image("${DOCKER_USER}/staging-${APP_NAME}:${TAG}").push()
                        docker.image("${DOCKER_USER}/staging-${APP_NAME}:latest").push()
                    }
                }
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
        stage('Production - Clean local Docker image') {
            steps {
                // push image to github container registry
                echo 'Clean local Docker image'
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
        cleanup {
            sh 'docker image prune -f'
        }
    }
}
