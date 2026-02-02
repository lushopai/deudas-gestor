pipeline {
    agent any

    environment {
        // Definir variables de entorno si es necesario
        DOCKER_COMPOSE_CMD = 'docker compose' // O 'docker-compose' dependiendo de la versión
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                script {
                    echo 'Building Backend with Maven...'
                    dir('gastos-compartidos') {
                        // Usamos el wrapper mvnw si es Linux, asegurando permisos de ejecución
                        sh 'chmod +x mvnw'
                        sh './mvnw clean package -DskipTests'
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    echo 'Building Frontend with npm...'
                    dir('gastos-compartidos-front') {
                        // Se asume que node/npm están instalados en el agente o se usa una imagen de docker para este stage
                        // Si estás ejecutando jenkins directamente en ubuntu, asegúrate de tener npm
                        sh 'npm install'
                        sh 'npm run build'
                    }
                }
            }
        }

        stage('Docker Build & Deploy') {
            steps {
                script {
                    echo 'Building Docker Images and Deploying...'
                    // Esto usa el docker-compose.yml de la raíz
                    sh '${DOCKER_COMPOSE_CMD} down'
                    sh '${DOCKER_COMPOSE_CMD} build'
                    sh '${DOCKER_COMPOSE_CMD} up -d'
                }
            }
        }

        stage('Verify Health') {
            steps {
                script {
                    echo 'Waiting for services to be healthy...'
                    sleep 30
                    sh '${DOCKER_COMPOSE_CMD} ps'
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed.'
        }
    }
}
