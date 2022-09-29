---
title: My 2K$ AWS mistake
---

November 13th, 18h Paris time, I get call from the US - my Nexus 5 tells me it's from Washington. Living in France and knowing nobody there, I dismissed it, like I always do with calls from a phone number I don't have in my contacts.
No message left in my voicemail, I figured it was a mistake.

2 hours later, I received an email from Amazon, telling me that my AWS account was compromised. In this email was a github URL of a file containing my API and secret keys. The github repo was one of my projects, which I created 3 hours earlier.
I logged in immediately in my AWS account, and noticed that 20 servers were running in each region, totaling 140 servers. They were not the cheapest ones: c3.8xlarge Windows servers, pricing between 3 and 4$ an hour depending on the region.

I killed all the servers, and revoked my API key as fast as I could.
The attackers had not created any IAM user, nor launched any other AWS product. I was safe by then.

Fortunately, that access key was the only piece of info they could get their hands on. Since I use 2FA for my AWS account, I was confident my main password was safe (I changed it anyway).

So how did this happen?

- I was working on a project needing my AWS credentials to create Amazon affiliates URLs (one would wonder why the Amazon affiliates program needs an AWS credential in the first place...)
- I pushed the project on my (public) github repo at 15h30 Paris time. The AWS credentials were saved in a specific config file, but this file was included in the commit.
- I guess a robot scanning github got the push and found the oh-so-obfuscated variable names "AWS_ACCESS_KEY_ID" and "AWS_SECRET_KEY", with their values in clear.
- the robot did its thing
- amazon noticed the unusual activity (I have zero EC2 server running full time) and contacted me

What I've learned:

- Never commit API credentials to a repo
- I've created a stub config file containing empty credentials values to let the other devs where to put the real credentials. This stub file is commited.
- I don't really like using environment variables to hold this kind of sensitive info: it as an Android project and I can't figure out how to store it elsewhere.

I'd like to thank Amazon for reacting so quickly. Without them noticing the unusual activity, the servers would certainly have run for several days or weeks.
Also, a big thanks to them for re-crediting me the amount of compute hours I "spent". The servers ran for 3 hours, spending a total of 1,639.56$. I even didn't have to ask them, they told me that since I'd deactivated the key and done the cleaning, I was OK.
