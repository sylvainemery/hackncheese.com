---
title: Web push notif - what can be done today (as of 2016-01-08)
---

# Supported browsers

## Chrome

Since version 42 [^1], rolled out on 2015-04-15. [^2]

Works on desktop (win, mac, linux), and android. iOS not supported. [^3]

## Firefox

Since version 44 [^5], in beta since 2015-12-14, ETA 2016-01-26. [^6]

Works on desktop (win, mac, linux), not on mobile (no user base though). [^3]

## Safari

Not following the standards. [^9]

Works on OSX since 10.9 Mavericks [^7], released on 2013-10-22). [^8]

## Edge (MS)

Currently in consideration, no ETA. [^4]

# Standard Web Push

## How it works

It works with 3 browser features : Web notifications, Service worker and Push API.

The website has to be HTTPS.

What is shown and is customizable in a notification:

- icon, square
- title, approx 40 chars. Cr doesn't show more than 2 lines (approx 60 chars) and FF 1 line (approx 40 chars)
- content, approx 90 chars on 3 lines. Cr doesn't show more than 3 lines (approx 90 chars) and FF max 15 lines or 200 chars [^11]
- redirect URL on click

In Chrome, no data can be sent within the push message. You just get a push message, if you want to individually customize the content of the notification, you have to get the data somewhere else (eg via XHR to a server, passing it the subscription ID and getting data in return). Sending data within the push message is in development. [^10]

Firefox allows for (encrypted) data to be sent within the push message (4080 bytes max). [^12]

Notification stays visible until clicked.

Chrome needs specific GCM URLS, this will change eventually to be more standard (as Firefox is).

TTL via GCM (Chrome) : ability to not send the notif after a certain period.

Topics (collapse key) can be used to supercede one notification by another.

The browser has to be running for the push message to be received. Some Chrome extensions make it run in the background.

## Tracking

### Delivery

Service worker can make an XHR call with the subscription ID to tell the server that the delivery is complete and the notification shown.

### Click

The URL in the push message can simply be a tracking URL. The service worker can add the Subscription ID in the URL if needed.

## HTTP only, really?

Some vendors work this way:

- the client puts a snippet on its web page
- the snippet calls the vendor's "sdk"
- the sdk takes care of displaying a pop-in telling that the permission will be asked for
- then the popin calls a popup hosted in https on a subdomain (eg client.vendor.com), that in turn asks for the push permission
- the permission is then granted to the vendor's subdomain

Pros:

- much simpler for the client

Cons:

- 2 clics instead of one, longer to load with the popup
- client.vendor.com url is not as easily trusted as client.com
- user can't easily see what permissions the website really has, he never goes to client.vendor.com

# Safari Web Push [^9]

The website doesn't need to be HTTPS.

Registration is made on the Apple Member Center, like for any push notification. Certificate is created by Apple.

A special file 'push package' has to be uploaded to the web server. It contains icons, possibly a user-specific ID and the redirect url (with placeholders). It has to be signed with the certificate.

When the user grants permission, Safari calls an endpoint in the server, passing it a generated user token. If a user-specific ID was given in the push package, Safari will also pass it in the request.
The token is accessible in JS in Safari, so one could call another endpoint to group the token and another more meaningful user ID.

The notification payload contains the title, the body and args to be replaced in the predefined url. Max payload size is 256 bytes - 55 for the mandatory structure = 201 bytes.

# Vendors

goroost.com

- demo : https://goroost.com/try-web-push (works in Cr & FF, Safari untested), http

wonderpush.com

- demo : http, crashes FF

pushcrew.com

- demo : https://apidemo.pushcrew.com/ http, FF not implemented, simplest code, demo not working

onesignal.com

- demo not working, no sign of service worker

pushengage.com

- demo not working well, FF not supported

[^1]: https://www.chromestatus.com/features#push
[^2]: https://en.wikipedia.org/wiki/Google_Chrome_release_history
[^3]: http://caniuse.com/#feat=push-api
[^4]: http://status.modern.ie/pushapi
[^5]: https://developer.mozilla.org/en-US/docs/Web/API/Push_API#Browser_Compatibility
[^6]: https://wiki.mozilla.org/RapidRelease/Calendar
[^7]: https://developer.apple.com/notifications/safari-push-notifications/
[^8]: https://en.wikipedia.org/wiki/OS_X_Mavericks#Releases
[^9]: https://developer.apple.com/library/mac/documentation/NetworkingInternet/Conceptual/NotificationProgrammingGuideForWebsites/PushNotifications/PushNotifications.html
[^10]: https://www.chromestatus.com/features/5746279325892608
[^11]: http://jsfiddle.net/yoshi6jp/Umc9A/
[^12]: https://tools.ietf.org/html/draft-thomson-webpush-encryption-01#section-3
