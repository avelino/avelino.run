+++
date = "2014-03-06"
title = "Golang, C and Python the benchmark time"
tags = ["golang", "c", "python", "benchmark"]
aliases = ["/2014/03/golang-c-and-python-the-benchmark-time"]
+++

I was wondering how performant Golang is, so I decided to put together a little benchmarking example for myself.

The benchmark will be done in my personal computer:


```
Processor  3 GHz Intel Core i7
Memory  8 GB 1600 MHz DDR3
Software  OS X 10.9.2 (13C64)
```

![vs benchmark time](/vs.png#center)


So I started with Python, which is what I know best and created the following simple script;

{{< gist avelino b66dfb057504c4ad93452d037e1ed5c1 "factorial.py" >}}

The reason for the **total** output, was to have a check to ensure that I was getting the same results in each of the scripts. To make sure that they are doing the same amount of work.

Running the script gives us the following execution time;


```
$ time python factorial.py

total: 591400000

0.68s user
0.01s system
99% cpu
0.688 total
```


So I am getting about 1s in total execution time. Not bad.

Now the same code sample in C, to see what the time execution would be;

{{< gist avelino f2ccbba0573dbbf80dbc1cf955d49b7d "factorial.c" >}}

Compile and execute the above snippet of code;


```
$ gcc factorial.c -o factorial
$ time ./factorial

total: 591400000

0.01s user
0.00s system
91% cpu
0.016 total
```


Ok, that's quite an improvement. This is C, so we do expect there to be a great improvement.

Finally we create our code sample in Go;

{{< gist avelino 2266fc463ac021af99cb85664f2627b1 "factorial.go" >}}

Then build and run the code sample and we get the following;


```
$ go build factorial.go
$ time ./factorial

total:  591400000

0.01s user
0.00s system
93% cpu
0.018 total
```


So, that's pretty much the same as C, which is excellent. The best part of it all, is that it is actually fun to code in Go compared to C. Python was always an attraction for me as the language is a breeze to work with and enjoyable programming with it. Go is also a nice language to work with and it's really fast to boot. So I'm very excited about the language.
