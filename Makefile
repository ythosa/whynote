.PHONY: setup
setup:
	npm link --force

.PHONY: dependencies
dependencies:
	npm i

.PHONY: data
data:
	git update-index --assume-unchanged app/data/data_file.json

.DEFAULT_GOAL := setup