github:
	liquidluck build -v
	ghp-import -b master deploy
	git push origin master

run:
	liquidluck build -v
	liquidluck server

.PHONY: github run
