TESTS = test/src/*

npm-test: lint test

lint:
	./node_modules/.bin/jshint ./ && ./node_modules/.bin/jscs ./

test:
	@echo "Running tests..."
	@NODE_ENV=test ./node_modules/.bin/mocha \
		$(TESTS) \
		--bail

release:
	./node_modules/.bin/gulp csstime-mode-release && ./node_modules/.bin/gulp release

release-web:
	make release && ./node_modules/.bin/gulp uglify

watch:
	./node_modules/.bin/gulp csstime-mode-watch & ./node_modules/.bin/gulp watch

.PHONY: test