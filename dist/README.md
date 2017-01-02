![img](https://circleci.com/gh/raintank/worldping-app.svg?style=shield&circle-token=:circle-token)

worldPing is a plugin for Grafana that continually tests, stores and alerts on the global performance and availability of your Internet applications so you can pinpoint issues, fix them immediately, and improve your user’s experience.

You can use worldPing to get a real-time view of any endpoint's performance and availability. As often as every 10 seconds, we will test your application from dozens of Probes around the world, Alerting you in real-time if there are any outages or slow-downs.

![worldPing Diagram](https://grafana.net/img/worldping_graph.svg)

## Live Demo

A live demo of worldPing is available at [worldping-demo.raintank.io](http://worldping-demo.raintank.io/)

## Features

There’s no software or agent to install or configure. Be up and running wih worldPing in less than 60 seconds. Just give us the domain name of your site or application, and we’ll automatically detect what to monitor.

This means you can catch micro-outages that might not otherwise show up, be alerted much faster, and troubleshoot in real-time. This kind of resolution and metric volume would normally cost hundreds or even thousands of dollars per month with other providers.


### Supported Protocols

Is the problem a regional network issue? DNS, yet again? A slowdown in the backend? worldPing allows you to pinpoint the problem through gorgeous visualizations, giving you context across different layers of the stack:

- Ping uptime and performance (eg. latency, loss, jitter)
- DNS uptime and performance (eg. latency, responses)
- HTTP and HTTPS (uptime and performance)

You can configure each endpoint to your exact needs, but we will autosuggest protocols based on what we can probe.

### Alerting

When you have a problem, worldPing will send you a high quality and speedy alert, configurable on a per-endpoint basis. It also helps triage by pinpointing the problem to a particular region or part of your stack.

Errors are validated across multiple locations to reduce false positives.

### API Access
Anything that you can do through the UI you can also do through our full featured HTTP API, docs can be found at [docs.worldping.apiary.io](http://docs.worldping.apiary.io)

### Requirements
WorldPing requires only a [Grafana.net](http://grafana.net) account and [Grafana 3.x](http://grafana.org/download) to install. There are no other external dependencies, accounts or configuration needed.

## Getting Help

### Documentation
- [worldPing Usecases](http://worldping.raintank.io/worldping/use-cases)

- [worldPing FAQ](http://worldping.raintank.io/worldping/faq)

- [worldPing documentation](http://worldping.raintank.io/docs/)

### Support
- Join our public slack channel; sign up at [http://slack.raintank.io](http://slack.raintank.io). This provide real-time access to both the raintank team and the growing community of worldPing and Grafana users.
- Email [support@raintank.io](mailto:support@raintank.io).

------

#### Changelog

##### v1.2.1

- fix issue with worldmap panel

##### v1.2.0
- Endpoint config now pulls probe defaults from the backend, being able to better tailor the checks to the available quota.
- Bug fixes.
