# Swift Language (Apple) first steps

- date: 2014-06-04 01:00
- author: avelino
- category: swift
- tags: swift, apple, lang, python, ruby
- slug: swift-language-apple-first-steps

-------

Apple launched the Swift language (Looking for the Swift parallel scripting
language? Please visit http://swift-lang.org) at WWDC 2014. A modern language
to program for Mac and iOS!

Strongly typed language, where you explicitly what type (variable, arguments,
and function returns), syntax reminds dynamic languages with
Python, Go, Ruby and JavaScript.

Apple offers a free comprehensive guide on language in
[HTML](https://developer.apple.com/library/prerelease/ios/documentation/Swift/Conceptual/Swift_Programming_Language/) and
[iBook](https://itunes.apple.com/us/book/the-swift-programming-language/id881256329?mt=11) formats.


* We can put zero left freely to improve readability, insert _ to separate groups
of numbers and add the + in front. That server to improve readability of the
program (does not alter the value of the number):


```ruby
let a = 1000000
let b = 0.0000001

// readable
let a = 1_000_000
let b = 0.000_000_1
```


* Practical numerical ranges: `0..5` and `0...5` (Ruby)


* Unicode variables:


```ruby
let π = 3.1415926
```


* Tween strings (expand variables and expressions inside strings):


```ruby
var name = "Thiago Avelino"
var yaer = 25
println "Hi, my name \(name), 'm \(year) years."
```


* Few functions/methods native to strings works:

* * hasPrefix
* * hasSuffix
* * uppercaseString
* * lowercaseString
* * countElements
* * isEmpty


* Not have regular expressions


* Ternary operators: `(condition ? yes : no)`


I liked the language, as 'm used to not bother me Go explicit types, lack of
regular expression can be a problem seems, but it is a pleasant language to
learn!