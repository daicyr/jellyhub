// push sur develop run juste la ci (lint, fmt, build, tests)
// push sur pr dev -> main, run ci + cd en preprod
// push / merge dans main, ci/cd complete + deploy en prod

pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Bun') {
            steps {
                sh """
                    docker run --rm \
                      -v ${WORKSPACE}:/app \
                      -w /app \
                      -u $(id -u):$(id -g) \
                      oven/bun:latest \
                      sh -c "bun --version && bun install --frozen-lockfile"
                """
            }
        }
        stage('Lint') {
            steps {
                // lint
                echo 'lint'
            }
        }
        stage('Fmt') {
            steps {
                // format
                echo 'format'
            }
        }
        stage('Build') {
            steps {
                // Build
                echo 'Build'
            }
        }
        stage('Tests') {
            steps {
                // run tests
                echo 'run tests'
            }
        }
        stage('Build Image') {
            steps {
                // build docker image
                echo 'build docker image'
            }
        }
        stage('Analyze Image') {
            steps {
                // analyze docker image with trivy scan
                echo 'analyze docker image with trivy scan'
            }
        }
        stage('Push image to ghcr.io') {
            steps {
                // push image to github container registry
                echo 'push image to github container registry'
            }
        }
    }
}
