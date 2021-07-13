+++
date = "2021-07-11"
title = "7 subjects (and GitHub repositories) to become a better Go Developer"
tags = ["golang", "go developer", "software engineer", "better-developer"]
url = "7-subjects-and-github-repositories-to-become-a-better-go-developer"
images = ["/blog/7-subjects-and-github-repositories-to-become-a-better-go-developer.png"]
+++

![7 subjects (and GitHub repositories) to become a better Go Developer](/blog/7-subjects-and-github-repositories-to-become-a-better-go-developer.png#center)

With the high adoption of the Go language by developers and large companies, this has led companies to search for engineers with experience in Go.

This can create a lot of pressure of what to study to become a better engineer, this is very personal, it requires planning of what and when to study other subjects (even outside the engineering area).

In this blogpost some topics (with repositories and links) that I think are important to know in order to become an engineer person with even better Go knowledge, follow good practices for writing code, concepts of code structure (usually using design pattern), scalable code and clean code.

## Style guide

I can't list only one link (repository) for this topic, I would recommend you to read for these 3 links and bring to your team's day to day life what best fits their reality — remember to use as base the official language documentation and add what makes sense from the other links

[Effective Go](https://golang.org/doc/effective_go)

{{< github "uber-go/guide" >}}

[Google Style Guides](https://google.github.io/styleguide/)

[Go standards and style guidelines | GitLab](https://docs.gitlab.com/ee/development/go_guide/)

## Best Practices

[Francesc Campoy](https://twitter.com/francesc) gave an excellent talk at OSCON 2015 on this subject, where he covered best practices for developing software using the Go language.

{{< youtube 8D3Vmm1BGoY >}}

**Slides**

[Twelve Go Best Practices](https://talks.golang.org/2013/bestpractices.slide#1)

## Algorithms Implemented

{{< github "TheAlgorithms/Go" >}}

This repository contains Go based examples of many popular algorithms and data structures.

Each algorithm and data structure has its own separate README with related explanations and links for further reading.

## Clean Code

A reference for the Go community that covers the fundamentals of writing clean code and discusses concrete refactoring examples specific to Go.

{{< github "Pungyeon/clean-go-article" >}}

## Clean Architecture

In his book “Clean Architecture: A Craftsman’s Guide to Software Structure and Design” famous author Robert “Uncle Bob” Martin presents an architecture with some important points like testability and independence of frameworks, databases and interfaces.

{{< github "bxcodec/go-clean-arch" >}}

[Elton Minetto](https://twitter.com/eminetto) has written two excellent blogposts on the subject:

1. [Clean Architecture using Golang](https://eminetto.medium.com/clean-architecture-using-golang-b63587aa5e3f)
2. [Clean Architecture, 2 years later](https://eltonminetto.dev/en/post/2020-07-06-clean-architecture-2years-later/)

## Awesome Go

I couldn't leave out the awesome-go project (which I started in 2014 and today many contributors help me maintain)

{{< github "avelino/awesome-go" >}}

A collection of awesome Go libraries and resources. This repository contains a list of variety of frameworks, template engines, articles and post, documentations, reactive and functional programming and much more which will increase your resourcefulness and might also help you to choose the tech stack for your next projects.

## Project Guideline

This is a complicated subject, there is no standard that will work perfectly for what you are developing, I recommend understanding the concept of project architecture (not only Go) and together with your team understand what works for you, even though there are thousands of books to give you knowledge about the subject I recommend putting your hands in the code and allow you to make mistakes, it is the best way to evolve.

Read this content before any other

[How to Write Go Code](https://golang.org/doc/code)

Now that you have read the previous link I will recommend a controversial repository by its name, it is not "Golang standards project layout", but there is a project structure that can help in the development of a new project - understand what makes sense for you (and your team), what doesn't, just ignore it.

{{< github "golang-standards/project-layout" >}}

> [Read why I said this project is controversial](https://github.com/golang-standards/project-layout/issues/117)

----

**Vote Of Thanks**

Thank you so much for reading this post and I hope you find these repositories as useful as I do and will help you to become better go developer. Feel Free to give any suggestions and if you like my work you can follow me on [Twitter](https://twitter.com/avelinorun)
