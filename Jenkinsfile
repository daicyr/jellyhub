// push sur develop run juste la ci (lint, fmt, build, tests)
// push sur pr dev -> main, run ci + cd en preprod
// push / merge dans main, ci/cd complete + deploy en prod

pipeline {
    agent any

    environment {
        BUN_INSTALL = "${WORKSPACE}/.bun"
        PATH = "${WORKSPACE}/.bun/bin:${env.PATH}"
        APP_NAME = 'jellyhub-app'
        DOCKER_USER = 'daicyr'
        TAG = "${env.GIT_COMMIT.take(8)}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                scmSkip(deleteBuild: true, skipPattern:'.*\\[skip ci\\].*')
            }
        }

        stage('Setup Bun') {
            steps {
                sh '''
                    curl -fsSL https://bun.sh/install | bash
                    bun --version
                '''
            }
        }
        stage('Install dependencies') {
            steps {
                sh 'bun install --frozen-lockfile'
            }
        }

        /*************************/
        /* Tests and Validations */
        /*************************/
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

        stage('E2E Tests') {
            steps {
                sh 'bun run test:e2e:install'
                sh 'docker compose -f tests/compose.e2e.yaml up -d --wait'
                sh 'bun run test:e2e'
            }
            post {
                always {
                    sh 'docker compose -f tests/compose.e2e.yaml down -v'
                }
            }
        }

        stage('SonarQube analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }

        /***********/
        /* Staging */
        /***********/
        stage('Staging') {
            when {
                branch 'Staging'
            }

            stages {
                stage('Staging - Build Docker image') {
                    steps {
                        sh """
                            docker build -t staging-${APP_NAME} .
                            docker tag staging-${APP_NAME} ${DOCKER_USER}/staging-${APP_NAME}:${TAG}
                            docker tag staging-${APP_NAME} ${DOCKER_USER}/staging-${APP_NAME}:latest
                        """
                    }
                }
                stage('Staging - Analyze Image') {
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
                    steps {
                        script {
                            docker.withRegistry('https://registry.hub.docker.com',  'DOCKER_HUB_CREDENTIALS') {
                                docker.image("${DOCKER_USER}/staging-${APP_NAME}:${TAG}").push()
                                docker.image("${DOCKER_USER}/staging-${APP_NAME}:latest").push()
                            }
                        }
                    }
                }

                stage('Staging - Update deployment') {
                    steps {
                        withCredentials([gitUsernamePassword(credentialsId: 'GithubAccessToken', gitToolName: 'Default')]) {
                            sh """
                                git fetch origin develop
                                git checkout -B develop origin/develop
                                sed -i 's|image: .*|image: ${DOCKER_USER}/staging-${APP_NAME}:${TAG}|' k8s/staging/jellyhub-deployment.yaml
                                git add k8s/staging/jellyhub-deployment.yaml
                                git diff --cached --quiet || git -c user.name=Jenkins -c user.email=jenkins@noreply-jenkins.com commit -m 'ci: deploy staging ${TAG} [skip ci]'
                                git push origin develop
                            """
                        }
                    }
                }
            }
        }

        /**************/
        /* Production */
        /**************/
        stage('Production') {
            when {
                branch 'Production'
            }
            stages {
                stage('Production - Build Image') {
                    steps {
                        sh """
                            docker build -t production-${APP_NAME} .
                            docker tag production-${APP_NAME} ${DOCKER_USER}/production-${APP_NAME}:${TAG}
                            docker tag production-${APP_NAME} ${DOCKER_USER}/production-${APP_NAME}:latest
                        """
                    }
                }
                stage('Production - Analyze Image') {
                    steps {
                        sh """
                            docker run --rm \
                                -v /var/run/docker.sock:/var/run/docker.sock \
                                -v trivy-cache:/root/.cache/ \
                                aquasec/trivy:latest image \
                                    --severity HIGH,CRITICAL \
                                    --exit-code 1 \
                                    production-${APP_NAME}
                        """
                    }
                }
                stage('Production - Push Docker image to DockerHub') {
                    steps {
                        script {
                            docker.withRegistry('https://registry.hub.docker.com', 'DOCKER_HUB_CREDENTIALS') {
                                docker.image("${DOCKER_USER}/production-${APP_NAME}:${TAG}").push()
                                docker.image("${DOCKER_USER}/production-${APP_NAME}:latest").push()
                            }
                        }
                    }
                }

                stage('Production - Update deployment') {
                    steps {
                        withCredentials([gitUsernamePassword(credentialsId: 'GithubAccessToken', gitToolName: 'Default')]) {
                            sh """
                                git fetch origin main
                                git checkout -B main origin/main
                                sed -i 's|image: .*|image: ${DOCKER_USER}/production-${APP_NAME}:${TAG}|' k8s/prod/jellyhub-deployment.yaml
                                git add k8s/prod/jellyhub-deployment.yaml
                                git diff --cached --quiet || git -c user.name=Jenkins -c user.email=jenkins@noreply-jenkins.com commit -m 'ci: deploy production ${TAG} [skip ci]'
                                git push origin main
                            """
                        }
                    }
                }
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
            echo 'Cleaning up Docker images'
            sh '''
                docker image rm \
                    "daicyr/staging-jellyhub-app:${TAG}" \
                    daicyr/staging-jellyhub-app:latest \
                    "daicyr/production-jellyhub-app:${TAG}" \
                    daicyr/production-jellyhub-app:latest || true
            '''
        }
    }
}
