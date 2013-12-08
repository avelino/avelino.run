github:
	liquidluck build -v
	ghp-import deploy
	git push origin gh-pages

run:
	liquidluck build -v
	liquidluck server

.PHONY: github run
