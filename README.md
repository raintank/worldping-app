[worldPing](http://raintank.io/worldping/) is a plug-in for Grafana that continually tests, stores and alerts on the global performance and availability of your Internet applications so you can pinpoint issues, fix them immediately, and improve your user’s experience.

### Documentation
- [worldPing Usecases](http://raintank.io/worldping/use-cases)

- [worldPing FAQ](http://raintank.io/worldping/faq)

- [worldPing documentation - http://raintank.io/docs](http://raintank.io/docs/)

### Installation

Use the new grafana-cli tool to install worldPing from the commandline:

```
grafana-cli install worldping-app
```

The plugin will be installed into your grafana plugins directory; the default is /var/lib/grafana/plugins if you installed the grafana package.

More instructions on the cli tool can be found [here](http://docs.grafana.org/v3.0/plugins/installation/).

You need the lastest grafana build for Grafana 3.0 to enable plugin support. You can get it here : http://grafana.org/download/builds.html
