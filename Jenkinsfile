pipeline {
    agent any
    stages {
        stage('Build Backend Image') {
            steps {
                sh 'docker build -t praveenmethraskar/backend:latest backend/'
                sh 'docker push praveenmethraskar/backend:latest'
            }
        }
        stage('Build Frontend Image') {
            steps {
                sh 'docker build -t praveenmethraskar/frontend:latest client/'
                sh 'docker push praveenmethraskar/frontend:latest'
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                sh 'kubectl apply -f k8s/backend-deployment.yaml'
                sh 'kubectl apply -f k8s/frontend-deployment.yaml'
            }
        }
    }
}
