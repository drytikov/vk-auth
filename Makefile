run:
	npm run babel-node -- src/server.js

build:
	rm -rf dist
	npm run build

lint:
	npm run eslint .
