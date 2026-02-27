# Folder Structure
email-service/
│
├── src/
│   ├── server.js
│   ├── queue/
│   │   ├── emailQueue.js
│   ├── workers/
│   │   ├── transactionalWorker.js
│   │   ├── businessWorker.js
│   ├── templates/
│   │   ├── resetPassword.hbs
│   │   ├── verifyAccount.hbs
│   │   ├── orderPlaced.hbs
│   ├── services/
│   │   ├── mailer.js
│
├── package.json


## How to run on docker
To Run the project on Docker:
docker-compose up --build

To Check logs
docker logs

To check the processes running:
docker ps

