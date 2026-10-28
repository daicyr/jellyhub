// push sur develop run juste la ci (lint, fmt, build, tests)
// push sur pr dev -> main, run ci + cd en preprod
// push / merge dans main, ci/cd complete + deploy en prod

pipeline {
    agent any

    stages {
        stage('Setup') {
        // setup bun
        }
        stage('Lint') {
        // lint
        }
        stage('Fmt') {
        // format
        }
        stage('Build') {
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
