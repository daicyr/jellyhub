// push sur develop run juste la ci (lint, fmt, build, tests)
// push sur pr dev -> main, run ci + cd en preprod
// push / merge dans main, ci/cd complete + deploy en prod

pipeline {
    agent any

    environment {
        BUN_INSTALL = "${WORKSPACE}/.bun"
        PATH = "${WORKSPACE}/.bun/bin:${env.PATH}"
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
        stage('Staging - Build Image') {
            when {
                branch 'develop'
            }
            steps {
                // build docker image
                echo 'build docker image'
            }
        }
        stage('Production - Build Image') {
            when {
                branch 'main'
            }
            steps {
                // build docker image
                echo 'build docker image'
            }
        }
        stage('Staging - Analyze Image') {
            when {
                branch 'develop'
            }
            steps {
                // analyze docker image with trivy scan
                echo 'analyze docker image with trivy scan'
            }
        }
        stage('Production - Analyze Image') {
            when {
                branch 'main'
            }
            steps {
                // analyze docker image with trivy scan
                echo 'analyze docker image with trivy scan'
            }
        }
        stage('Staging - Push image to ghcr.io') {
            when {
                branch 'develop'
            }
            steps {
                // push image to github container registry
                echo 'push image to github container registry'
            }
        }
        stage('Production - Push image to ghcr.io') {
            when {
                branch 'main'
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
