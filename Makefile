APP_NAME := penpick
PORT ?= 5000

create_env_file: 
	@if [ ! -f .env ]; then cp -n .env.example .env; fi 

build-dev: create_env_file
	docker build --target dev -t ${APP_NAME} . 

build: create_env_file
	docker build --target production -t ${APP_NAME} . 

dev: build-dev
	docker run --rm -e PORT=${PORT} -v '$(shell pwd):/app' -v /app/node_modules --name ${APP_NAME} -p ${PORT}:${PORT} ${APP_NAME}

test:
	docker run --rm -v $(shell pwd):/app ${APP_NAME} sh -c 'npm run test'

deploy: create_env_file build
	docker run -d --restart always -e PORT=${PORT} -p ${PORT}:${PORT} --name ${APP_NAME} ${APP_NAME}

down:
	docker kill ${APP_NAME} && docker rm ${APP_NAME}
