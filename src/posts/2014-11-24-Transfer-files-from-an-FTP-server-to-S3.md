---
title: Transfer files from an FTP server to S3
excerpt: "At work, for a very long time, we used our network provider's cache server to serve our static files (mainly pictures).
We wanted a real CDN (as in globally distributed) that would be both faster and cheaper."
---

At work, for a very long time, we used our network provider's cache server to serve our static files (mainly pictures).
We wanted a real CDN (as in globally distributed) that would be both faster and cheaper.

We chose to use the AWS S3+CloudFront combination. It was a true CDN, it was faster than another provider we trialled and we wouldn't have to worry about the space used.

In order to choose the right tools to transfer the files from the old cache server to S3, we had these requirements:

- The old cache server could only be accessed via FTP.
- We needed to be able to mirror the source to the destination. Because our staff and apps would continue to use the old cache server while we would be ramping up on S3, we didn't want to retransfer all the files every day.
- Some of our directories contained several hundreds of thousands files. We needed a tool that could list these directories without crashing.
- We had approximately 90 GB in 3,3 million files to transfer. Taking days to transfer everything was not an option.

After a little digging, I couldn't find a single piece of software that could connect to the FTP and copy/transfer only the new/updated files on the fly to S3.

Finally, I decided to use the following method:

1. mirror the FTP files locally
2. mirror the local directory to S3

## Mirror the FTP locally

I used the versatile and robust [lftp](http://lftp.yar.ru/):

- It can transfer files in parallel, making it really fast.
- It can use several alternative methods to list directories, including one that can handle the very large directories without timing out or crashing.
- The mirror command works flawlessly, I tested it with several combinations of new/updated/deleted files.
- It keeps the original file timestamps.

So I booted up an m3.xlarge instance on EC2, added a volume big enough to hold all the files and launched this script:

```shell
lftp -e " \
  debug -t 2; \
  set net:max-retries 3; \
  set net:timeout 10m; \
  set ftp:use-mlsd on; \
  set ftp:charset iso-8859-1; \
  open -u USER:PASSWORD ftp.oldcacheserver.com; \
  mirror --parallel=30 --log=/tmp/lftpmirror.log; \
  exit; \
  "
```

`debug -t 2`: show only warnings and errors

`set net:max-retries 3` and `set net: timeout 10m`: because the defaults are too long

`set ftp:use-mlsd on`: this is the setting that made listing very large directories work

`set ftp:charset iso-8859-1`: we had files with special characters in their name uploaded from a Windows computer to the FTP server. Setting this charset made lftp create files with the right characters on the Linux VM with en_US.UTF-8 locale

`open -u USER:PASSWORD ftp.oldcacheserver.com`: the connection command

`mirror --parallel=30 --log=/tmp/lftpmirror.log`: mirror the whole FTP server with 30 threads and a logfile

It took approximately 7 hours to transfer all the FTP files to the EC2 instance.

## Mirror a local directory to S3

I used [s3-parallel-put](https://github.com/twpayne/s3-parallel-put) for the same reasons I used lftp: reliable, fast thanks to parallelism and able to handle very large directories.

These are the command I used:

```shell
export AWS_ACCESS_KEY_ID=THEAWSACCESSKEY
export AWS_SECRET_ACCESS_KEY=THEAWSSECRETACCESSKEY

python s3-parallel-put --bucket=BUCKET_NAME --secure --put=update --processes=30 --content-type=guess --log-filename=/tmp/s3pp.log .
```

First I export my AWS credentials in environment variables because s3-parallel-put needs the values this way.

Then I launch s3-parallel-put:

- specifying the bucket name
- forcing the use of the HTTPS API
- forcing the update method for each file
- spawning 30 threads to go faster
- using the `content-type=guess` option: it allows s3-parallel-put to specify the file type while uploading (it can only detect pictures, but that's what I was uploading). It's important because otherwise AWS doesn't send the right HTTP header to the browser, and when accessed directly a picture is downloaded instead of being shown in the browser.

The EC2 instance being in the same region of my S3 bucket, the initial upload was blazing fast and took only 1.5 hours.

## Rinse, repeat

The initial "snapshot" of the FTP to S3 took long, but then mirroring the FTP locally and mirroring to S3 took only the time to traverse all directories to detect and download the changed files &mdash; in my case: 35+38 minutes.

I made a small shell script combining the two commands, and scheduled it twice a day.

## Going further

There is an intriguing option to the mirror command of lftp: `on-change`. It seems that if lftp detects a change, it can launch a shell script.

It would be interesting to know:

- what does a "change" mean? Updated file? New file also?
- is the script launched for each changed file or more globally at the end of the mirror?
- what parameters are passed to the shell script?

By quickly browsing the [lftp source code](https://github.com/lavv17/lftp), it seems that the script is launched at the end of the mirror. In my case, it would have been more interesting if it were launched for each modified file: I could have used an S3 file uploader to upload each new/modified file individually.

Maybe in a future version, or _&mdash; if I dare dive into C++ again &mdash;_ in a pull-request! :smile:
