TESTS = test/src/*
PRODUCT_NAME = HealthyNotifications

npm-test: lint test

lint:
	./node_modules/.bin/jshint ./ && ./node_modules/.bin/jscs ./

test:
	@echo "Running tests..."
	@NODE_ENV=test ./node_modules/.bin/mocha \
		$(TESTS) \
		--bail

release:
	./node_modules/.bin/gulp csstime-mode-release

release-mac-osx:
	make release && ./node_modules/.bin/gulp release && ./node_modules/.bin/gulp electron:build && make brand

release-web:
	make release && ./node_modules/.bin/gulp release-web

brand:
	mv "./build/electron/Electron.app/Contents/Frameworks/Electron Helper EH.app/Contents/MacOS/Electron Helper EH" "./build/electron/Electron.app/Contents/Frameworks/Electron Helper EH.app/Contents/MacOS/$(PRODUCT_NAME) Helper EH" && \
	mv "./build/electron/Electron.app/Contents/Frameworks/Electron Helper EH.app/" "./build/electron/Electron.app/Contents/Frameworks/$(PRODUCT_NAME) Helper EH.app/" && \
	mv "./build/electron/Electron.app/Contents/Frameworks/Electron Helper NP.app/Contents/MacOS/Electron Helper NP" "./build/electron/Electron.app/Contents/Frameworks/Electron Helper NP.app/Contents/MacOS/$(PRODUCT_NAME) Helper NP" && \
	mv "./build/electron/Electron.app/Contents/Frameworks/Electron Helper NP.app/" "./build/electron/Electron.app/Contents/Frameworks/$(PRODUCT_NAME) Helper NP.app/" && \
	mv "./build/electron/Electron.app/Contents/Frameworks/Electron Helper.app/Contents/MacOS/Electron Helper" "./build/electron/Electron.app/Contents/Frameworks/Electron Helper.app/Contents/MacOS/$(PRODUCT_NAME) Helper" && \
	mv "./build/electron/Electron.app/Contents/Frameworks/Electron Helper.app/" "./build/electron/Electron.app/Contents/Frameworks/$(PRODUCT_NAME) Helper.app/" && \
	mv "./build/electron/Electron.app/Contents/MacOS/Electron" "./build/electron/Electron.app/Contents/MacOS/$(PRODUCT_NAME)" && \
	cp "./resources/atom.icns" "./build/electron/Electron.app/Contents/Resources/atom.icns" && \
	rm -rf "./build/electron/Electron.app/Contents/Resources/default_app" && \
	mv "./build/electron/Electron.app/" "./build/electron/$(PRODUCT_NAME).app/"

asar:
	./node_modules/.bin/asar pack "./build/electron/Electron.app/Contents/Resources/app" "./build/electron/Electron.app/Contents/Resources/app.asar"

watch:
	./node_modules/.bin/gulp csstime-mode-watch & ./node_modules/.bin/gulp watch

icns:
	iconutil -c icns ./resources/atom.iconset

.PHONY: test