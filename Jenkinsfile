pipeline {
    agent any

    stages {

        stage('Build Docker Images') {
            steps {
                bat 'docker compose build'
            }
        }

        stage('Stop Existing Containers') {
            steps {
                bat 'docker compose down --remove-orphans'
            }
        }

        stage('Start Application') {
            steps {
                bat 'docker compose up -d'
            }
        }

        stage('Verify Containers') {
            steps {
                bat 'docker compose ps'
            }
        }
    }

    post {
        success {
            echo 'SwiftTrack CI/CD Pipeline completed successfully!'
        }

        failure {
            echo 'SwiftTrack Pipeline failed. Check the console output.'
        }
    }
}
