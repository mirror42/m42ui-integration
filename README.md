# Mirror42 UI Integration Example Application

[Mirror42](http://mirror42.com) UI integrations exist for the Service-Now and Salesforce platforms. The way this is integrated can be applied to other platforms and/or any other UI framework as well. This is an example application showing how this can be achieved. This example shows how to integrate the Mirror42 Scorecards, Dashboards and Messages user interfaces.

This example application has been build with [Ruby on Rails](http://rubyonrails.org/), but any other programming language and web framework can be used just as easily.


## Installation

To install this example application you need to have a [ruby interpreter](http://www.ruby-lang.org/en/) available and at least the gem [bundler](http://gembundler.com/) installed. Below we assume a unix host:

```
$ git clone git://github.com/mirror42/m42ui-integration.git
$ cd m42ui-integration
$ bundle install
$ cp config/mirror42.template.yml config/mirror42.yml
```

Enter your the home URL and consumer secret key of your Mirror42 account in the file `config/mirror42.yml`. See this [wiki page](https://github.com/mirror42/m42ui-integration/wiki/Home-URL-and-Consumer-Secret) on how to determine these values for your Mirror42 account.

Make sure the email address that is mentioned in the file `app/helpers/application_helper.rb` matches an existing user in your Mirror42 account.

Then start the webserver:

```
$ run-with-bundler unicorn
```

And open the application in your web browser:

```
$ open http://localhost:8080/
```

<img src="https://raw.github.com/mirror42/m42ui-integration/master/public/images/m42ui-integration.png" width="727" height="505"/>


## Explanation

To understand how this works it's important to realise these main architectural points:

1. You serve the main web page that is shown to your users. The part that is served by Mirror42 is shown within an iframe that is defined within your web page. In the picture below the content inside the red frame is the iframe that is served by Mirror42, everything outside (including the exact URL source of the iframe) is controlled by you. <img src="https://raw.github.com/mirror42/m42ui-integration/master/public/images/m42ui-integration-iframe.png" width="500" height="348"/>

2. The URL used by the iframe contains an `apptoken` parameter which is encoded with an application-wide ["consumer secret"](https://github.com/mirror42/m42ui-integration/wiki/Home-URL-and-Consumer-Secret) that should only be shared by your Mirror42 account and your application. As this `apptoken` parameter is visible to the end user __it is essential the token is encoded on the server!__ Do not send the consumer secret to the clients browser and encode the token parameter there. The consumer secret should be guarded like a password.

3. With the `apptoken` parameter from the source URL of the iframe Mirror42 can determine which user needs to be served and if the request is valid (by checking the decoded form of the parameter matches the expected consumer secret defined in your Mirror42 account).


## Implementation Instructions

#### Client side code

In your webpage where you want the iframe containing Mirror42 content to appear add for example this piece of HTML code [(see also)](https://github.com/mirror42/m42ui-integration/blob/master/app/views/mirror42/dashboards.html.erb):

```
<script src="https://github.com/mirror42/m42ui-integration/blob/master/app/assets/javascripts/mirror42-show.js"></script>

<div id="mirror42"></div>

<script>Mirror42.show("<%= Mirror42Encryption.token(current_user) %>", "/dashboards");</script>
```



It is advised to download the [mirror42-show.js](https://github.com/mirror42/m42ui-integration/blob/master/app/assets/javascripts/mirror42-show.js) javascript file to your own servers and serve it from there instead.

In the above example there is a bit of dynamic code using ERB syntax: `<%= Mirror42Encryption.token(current_user) %>`. Basically this calls a server side function to create a token that is based on the current user and the shared application-wide consumer secret.

The end result of the HTML source send to the client might look like this:

```
<div id="mirror42"></div>
<script>Mirror42.show("https://mirror42-demo.mirror42.com#user@example.com:1358478768000:525a5570f9f0aa5678550701202833290528b4072ad3:sha1", "/dashboards");</script>
```

The `Mirror42.show` function is defined in the [mirror42-show.js](https://github.com/mirror42/m42ui-integration/blob/master/app/assets/javascripts/mirror42-show.js) javascript file. All it does is create an iframe element and inject it into the div element with id `mirror42`. So the end result in the browser DOM might look like this:

```
<div id="mirror42">
  <iframe src="https://mirror42-demo.mirror42.com/scorecards?apptoken=user%40example.com%3A1358478768000%3A525a5570f9f0aa5678550701202833290528b4072ad3%3Asha1"></iframe>
</div>
```

The `Mirror42.show` `function(token, url, height, width)` accepts four parameters:

* `token` : a string token generated server side (see below for algorithm on how to generate this token)
* `url` : an absolute or relative path to a Mirror42 resource. E.g. "/scorecards"
* `height` : the height of the iframe. Optional, defaults to "600px".
* `width` : the width of the iframe. Optional, defaults to "100%".


#### Server side code

On the server side you need to compute the token that is going to be the input into the client-side javascript function `Mirror42.show`. _This token is not to be confused with the `apptoken` parameter that is eventually used in the source URL of the iframe._

Example implementations of the algorithm are available in [ruby syntax](https://github.com/mirror42/m42ui-integration/blob/master/lib/mirror42_encryption.rb), in [javascript node.js syntax](https://github.com/mirror42/m42ui-integration/blob/master/lib/mirror42_encryption.js) or in [java APEX syntax](https://github.com/mirror42/m42ui-integration/blob/master/lib/mirror42_encryption.apex.java).

The token is a string which is build up as follows:

```
  home_url + "#" + user_email + ":" + time + ":" + sha + ':' + algorithm
```

* `home_url` : the absolute URL to your Mirror42 account. See [this wiki page](https://github.com/mirror42/m42ui-integration/wiki/Home-URL-and-Consumer-Secret) on how to determine this value for your Mirror42 account.
* `user_email` : the email address of the user used to authenticate against the Mirror42 service. Usually this will be the email address of the user currently logged into your application. This email address must match a user defined in your Mirror42 account.
* `time` : [unix time](http://en.wikipedia.org/wiki/Unix_time) in milliseconds.
* `sha` : a [secure hash](http://en.wikipedia.org/wiki/Secure_Hash_Algorithm) value described further in detail below.
* `algorithm` : The SHA function used, one of "sha1", "sha256", "sha384", "sha512".

The `sha` value is calculated as follows:

```
  hash(user_email + time + consumer_secret)
```

* `hash` : the [secure hash](http://en.wikipedia.org/wiki/Secure_Hash_Algorithm) function. Supported are SHA1, SHA256, SHA384, SHA512.
* `user_email` : same as the `user_email` value used to build the token string.
* `time` : same as the `time` value used to build the token string.
* `consumer_secret` : an application-wide consumer secret value defined in your Mirror42 account. See [this wiki page](https://github.com/mirror42/m42ui-integration/wiki/Home-URL-and-Consumer-Secret) on how to determine this value for your Mirror42 account.


----------------------------

Mirror42 is the initiater of [KPI Library](http://kpilibrary.com). KPI Library helps you to find the right performance indicators categorized by industry, by process and by business framework.
