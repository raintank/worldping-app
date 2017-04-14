![img](https://circleci.com/gh/raintank/worldping-app.svg?style=shield&circle-token=:circle-token)

worldPing is a plugin for Grafana that continually tests, stores and alerts on the global performance and availability of your Internet applications so you can pinpoint issues, fix them immediately, and improve your user’s experience.

You can use worldPing to get a real-time view of any endpoint's performance and availability. As often as every 10 seconds, we will test your application from dozens of Probes around the world, Alerting you in real-time if there are any outages or slow-downs.

![worldPing Diagram](https://grafana.com/img/worldping_graph.svg)

## Live Demo

A live demo of worldPing is available at [worldpingdemo.grafana.net](https://worldpingdemo.grafana.net)

## Features

There’s no software or agent to install or configure. Be up and running with worldPing in less than 60 seconds. Just give us the domain name of your site or application, and we’ll automatically detect what to monitor.

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

Now with worldPing v1.2.2+ and Grafana v4+, the sky is the limit. Using the 100% Graphite-compatible worldPing hosted data source, you can bring metrics-based alerting into your global performance monitoring.

### API Access
Anything that you can do through the UI you can also do through our full featured HTTP API, docs can be found at [docs.worldping.apiary.io](http://docs.worldping.apiary.io)

### Requirements
WorldPing requires only a [Grafana.com](https://grafana.com) account and [Grafana 3.x](https://grafana.com/grafana/download) to install. There are no other external dependencies, accounts or configuration needed.

## Getting Help

### Documentation
- [worldPing Usecases](http://worldping.raintank.io/worldping/use-cases)

- [worldPing FAQ](https://grafana.com/cloud/worldping#FAQ)

- [worldPing documentation](http://worldping.raintank.io/docs/)

### Support
- Join our community at [http://community.grafana.com](http://community.grafana.com). This provide real-time access to both the team and the growing community of worldPing and Grafana users. No additional logins required, just use your Grafana.com account.
- Email [support@grafana.com](mailto:support@grafana.com).

------

#### Changelog

##### v1.2.3
- Fixed a bug that caused the unsaved changes modal to appear on endpoint config when no changes were made.
- Addressed a bug in the DNS dashboard that triggers an unsaved changes warning in certain situations.

##### v1.2.2

- support body payload for HTTP/S checks
- add download limit adjustments for http/s checks.
- update datasource settings to enable using worldPing data with Grafana 4.x's built in alerting.
- fix links to event dashboard from endpoint details page.
- Updates to point to grafana.com, the new consolidated website for everything Grafana.

##### v1.2.1

- fix issue with worldmap panel

##### v1.2.0
- Endpoint config now pulls probe defaults from the backend, being able to better tailor the checks to the available quota.
- Bug fixes.
