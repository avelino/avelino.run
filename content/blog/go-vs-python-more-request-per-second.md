+++
date = "2015-01-17"
title = "Go vs Python more request per second"
tags = "go, python, benchmark"
aliases = ["/2015/01/go-vs-python-more-request-per-second"]
+++

![not everyt hing is nail, to use hammer](/silver-bullet.jpg#center)

I use python because it is a simple and powerful language, but never used by be excellence in performance (But for python web serves very well)! I know that benchmark based on **"Hello World"** does not want to say too much, but it's interessanta we know what technology (framework) is more time to answer performance web support request.

There is a python framework named [Falcon](http://falconframework.org) (Falcon follows the REST architectural style, meaning (among other things) that you think in terms of resources and state transitions, which map to HTTP verbs) which is extremely performance, even using asynchronous backup processing library (as [gevent](http://gevent.org), is a coroutine-based Python networking library that uses greenlet to provide a high-level asynchronous API on top of the libev event loop).

These days I commented on the social network about the performance of the falcon and some people commented that it would be interesting to do a benchmark with Go, and here I am writing a blogpost for the performance of a webserver written in Go and Python to see which responds more request per second!

Let's go...

## Falcon application

{{< gist avelino 154a2d612b4ff732558e81113762abde "main.py" >}}


## Go application

{{< gist avelino c8e8bc86e79335d9a9b10ff35fc75b5f "main.go" >}}


## Benchmark

Used:

```
ab -n10000 -c500 http://localhost:8080/
Intel(R) Core(TM) i7-3520M CPU @ 2.90GHz
8GB RAM
```

### Falcon

**Requests per second: 4888.35 in 2.046 seconds**

```
avelino@klm ~ $ ab -n10000 -c500 http://127.0.0.1:8080/
This is ApacheBench, Version 2.3 <$Revision: 1604373 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking 127.0.0.1 (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:
Server Hostname:        127.0.0.1
Server Port:            8080

Document Path:          /
Document Length:        11 bytes

Concurrency Level:      500
Time taken for tests:   2.046 seconds
Complete requests:      10000
Failed requests:        0
Total transferred:      1530000 bytes
HTML transferred:       110000 bytes
Requests per second:    4888.35 [#/sec] (mean)
Time per request:       102.284 [ms] (mean)
Time per request:       0.205 [ms] (mean, across all concurrent requests)
Transfer rate:          730.39 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0   29 166.7      0    1004
Processing:     2   29  37.8     23     436
Waiting:        2   29  37.8     23     436
Total:         14   58 193.7     23    1438

Percentage of the requests served within a certain time (ms)
  50%     23
  66%     25
  75%     25
  80%     25
  90%     28
  95%     50
  98%   1029
  99%   1232
 100%   1438 (longest request)
```

### Go

**Requests per second: 15711.36 in 0.636 seconds**

```
avelino@klm ~ $ ab -n10000 -c500 http://127.0.0.1:8080/
This is ApacheBench, Version 2.3 <$Revision: 1604373 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking 127.0.0.1 (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:
Server Hostname:        127.0.0.1
Server Port:            8080

Document Path:          /
Document Length:        11 bytes

Concurrency Level:      500
Time taken for tests:   0.636 seconds
Complete requests:      10000
Failed requests:        0
Total transferred:      1130000 bytes
HTML transferred:       110000 bytes
Requests per second:    15711.36 [#/sec] (mean)
Time per request:       31.824 [ms] (mean)
Time per request:       0.064 [ms] (mean, across all concurrent requests)
Transfer rate:          1733.77 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   1.7      0      12
Processing:     2    6   5.5      5     205
Waiting:        2    6   5.5      5     205
Total:          4    7   6.4      5     205

Percentage of the requests served within a certain time (ms)
  50%      5
  66%      6
  75%      6
  80%      6
  90%      7
  95%     13
  98%     28
  99%     33
 100%    205 (longest request)
```

We can let Go more performer (compiling software), follows the result after compiling:

**Requests per second: 20978.30 in 0.415 seconds**

## Conclusion

Yes Go is much more performatico than Python in web requests, nor why I stop programming in Python. Today we have a very large ecosystem in the world of Python where does Python be very powerful (and good), an example is mathematical libraries such as numpy, pandas and etc.

This blogpost is to show that Python (or what you want other technology) is not the silver bullet (solution to all the problems). Choose the right technology for your problem, not everything is nail, to use hammer!
