---
layout: post
title: 'Piwall: how to set up 4 screens to display one video'
---

prepare the sd card

sudo dd bs=4M if=jessie.img of=/dev/mmcblk0
sync

## slaves

remount the sdcard (eject/insert)

copy http://dl.piwall.co.uk/pwlibs1_1.1_armhf.deb to /var/tmp
copy http://dl.piwall.co.uk/pwomxplayer_20130815_armhf.deb to /var/tmp

cd /media/se/xxxxx

sudo nano etc/default/keyboard
XKBLAYOUT="fr"

sudo nano etc/dhcpcd.conf
add 1st line: denyinterfaces eth0

sudo nano etc/network/interfaces
auto eth0
iface eth0 inet static
address 192.168.22.??
netmask 255.255.255.0
up route add -net 224.0.0.0 netmask 240.0.0.0 eth0

sudo nano etc/init.d/piwall
#! /bin/sh

case "$1" in
start)
echo "Starting piwall"
/usr/local/bin/startwall
;;
stop)
echo "Stopping piwall"
killall startwall
;;
\*)
echo "Usage: /etc/init.d/piwall {start|stop}"
exit 1
;;
esac

exit 0

sudo chmod 755 etc/init.d/piwall

sudo nano usr/local/bin/startwall

#! /bin/sh
pwomxplayer --tile-code=XX udp://239.0.1.23:1234?buffer_size=1200000B

sudo chmod 755 usr/local/bin/startwall

sync

unmount

insert the sdcard in the raspi
1st boot, to gui
Raspberry Pi Configuration - extend partition - uncheck autologin - boot to CLI - overscan disabled - locale USA - keyboard fr
reboot

sudo dpkg -i /var/tmp/pwlibs1_1.1_armhf.deb
sudo dpkg -i /var/tmp/pwomxplayer_20130815_armhf.deb

sudo update-rc.d piwall start 100 3 4 5 . stop 100 0 1 6 .

## master

boot to cli and autologin

sudo apt-get install mpg123

at the home, create a videoloop.sh file:
#! /bin/sh
while true
do
avconv -re -i /var/tmp/movie.mp4 -vcodec copy -f avi -an udp://239.0.1.23:1234 -vn acodec copy -f mp3 pipe: | mpg123-alsa
done

at the end of the .bashrc:
. ~/videoloop.sh

to output sound on the jack:
amixer cset numid=3 1

## video

ffmpeg -i input.mp4 -qscale 0 -vcodec copy -acodec mp3 output.avi
