// push sur develop run juste la ci (lint, fmt, build, tests)
// push sur pr dev -> main, run ci + cd en preprod
// push / merge dans main, ci/cd complete + deploy en prod

pipeline {
    agent {
        docker {
            image 'node:26-alpine'
        }
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup') {
            // setup bun
            steps {
                sh """
                    curl -fsSL https://bun.sh/install | bash
                    bun install --frozen-lockfile
                """
            }
        }
        stage('Lint') {
        // lint
        }
        stage('Fmt') {
        // format
        }
        stage('Build') {
        }
        stage('Tests') {
        // run tests
        }
        // build app
        }
        stage('Tests') {
        // run tests
        }
        stage('Build Image') {
        // build docker image
        }
        stage('Analyze Image') {
        // analyze docker image with trivy scan
        }
        stage('Push image to ghcr.io') {
        // push image to github container registry
        }
    }
}
