+++
date = "2014-02-21"
title = "Business Intelligence (BI) Application Server written in Python"
tags = ["bi", "business", "intelligence", "python", "application", "tornado"]
aliases = ["/2014/02/business-intelligence-bi-application-server-written-in-python-openmining"]
+++

I started a new project with the name [OpenMining](https://github.com/mining/mining), new application server written in Python.

OpenMining is software for creating OLAP (online analytical processing) cubes (multi-dimensional) using Numpy, Scipy and Pandas for data management and flexibility in processing dynamical filters. Open-source provider of reporting, analysis, dashboard, data mining and workflow capabilities.

## Our goals

- Business Intelligence software (Pentaho/Jaspersoft) alternative;
- OLAP manager;
- Generate report (grid, charts, pdf and etc);
- Dashboard manager, link one or more element (report);
- Easy dashboard generate;
- Not one data is processed on the basis of source data;
- Friendly interface;
- Used websocket on cube load.

## Python libs used

- Pandas
- Numpy
- numexpr
- ipython
- Tornado
- SQLAlchemy
- RQ
- Riak client
- Redis client
- Memcached client

## More about OLAP cube

A cube can be considered a generalization of a three-dimensional spreadsheet. For example, a company might wish to summarize financial data by product, by time-period, and by city to compare actual and budget expenses. Product, time, city and scenario (actual and budget) are the data's dimensions.

Cube is a shortcut for multidimensional dataset, given that data can have an arbitrary number of dimensions. The term hypercube is sometimes used, especially for data with more than three dimensions.

Each cell of the cube holds a number that represents some measure of the business, such as sales, profits, expenses, budget and forecast.

OLAP data is typically stored in a star schema or snowflake schema in a relational data warehouse or in a special-purpose data management system. Measures are derived from the records in the fact table and dimensions are derived from the dimension tables.


## Contribute

Star and fork in [github.com/mining/mining](https://github.com/mining/mining), send pull request!
