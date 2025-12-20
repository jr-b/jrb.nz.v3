---
title: Privacy oriented Firefox set-up
tags: [macos, firefox]
date: 2020-07-09
---

> As of 2022, this is not the set-up I'm using anymore. I've moved to an hybrid solution, where I'm switching between Safari and Chrome on a daily basis depeding what work needs to be done.

Since the end of uBlock Origin on Safari, I've been using Firefox as my main browser. Here's how I'm setting it up so it's nice and fast.

## MaterialFox theme

> Inspired by Google's Material Design and their latest Google Chrome UI, this theme turns your Firefox into a Material-styled web browser. The aim was to style the browser as closely as possible to the latest Google Chrome dev builds, where practical.

This type of theme is installed by adding a userChrome.css file to your Firefox profile folder. The project is [actively updated on Github](https://github.com/muckSponge/MaterialFox). You can follow the recommended instructions to replicate even more the Chrome behavior. The releases version numbers are following the Firefox releases; use the one for your Firefox version.

## Search engines

I'm running a [Whoogle](https://github.com/benbusby/whoogle-search) instance on Heroku. To set it up as a search engine in Firefox, you only need to visit your Whoogle URL and then click "Add Search Engine" (the three dots button in the URL bar). You can then select Whoogle in the Firefox settings.

Since Whoogle replace Google, you can unselect Google as one of the alternate search engines. I still keep DuckDuckGo and Wikipeadia.

## Extensions

- **uBlock Origin** - truly the best extension to control what's loaded on a page. Litteraly can't browse the web without this one.
- **Are.na** - Are.na extension to add blocks to your channels.
- **Firefox Multi-Account Containers**
- **Web Archives** - Allows to search for cached content (Google, Bing, etc.) or to query the Wayback Machine with an URL (still new to this extension).

## `about:config` modifications

I've been adjusting a couple of settings in `about:config`:

### Disabling animations

`cosmeticAnimations` to `false`  
`full-screen-api.transition-duration.enter` to `0`  
`full-screen-api.transition-duration.leave` to `0`

### Disabling Pocket

`extensions.pocket.enabled` to `false`

### Privacy[^1]

`geo.enabled` to `false`  
`privacy.firstparty.isolate` to `true`  
`privacy.resistFingerprinting` to `true`  
`browser.cache.offline.enable` to `false`  
`browser.urlbar.speculativeConnect.enabled` to `false`  
`dom.battery.enabled` to `false`  
`dom.event.clipboardevents.enabled` to `false`  
`network.cookie.cookieBehavior` to `1`  
`network.cookie.lifetimePolicy` to `2`  
`network.http.referer.trimmingPolicy` to `2`  
`webgl.disabled` to `true`

### Random

`general.smoothScroll.mouseWheel.durationMaxMS` to `200`[^2]  
`security.insecure_connection_text.enabled` to `true`  
`browser.aboutConfig.showWarning` to `false`  
`browser.urlbar.trimURLs` to `false`

[^1]: For details about each entry, see [Firefox: Privacy Related "about:config" Tweaks](https://wiki.mozilla.org/Privacy/Privacy_Task_Force/firefox_about_config_privacy_tweeks). A lot more can be found on this list: [About:config_Entries](http://kb.mozillazine.org/Firefox_:_FAQs_:_About:config_Entries).
[^2]: More details on Firefox scroll tweaks can be found here: [Firefox Scroll Tweak](https://web.archive.org/web/20171214193241/http://12bytes.org/tech/firefox-scroll-tweak)
