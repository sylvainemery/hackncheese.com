---
title: Installing Gentoo on an HP Folio 9470m laptop
excerpt: 'This post is the instructions list I followed to install Gentoo on my new work laptop: an HP Folio 9470m.'
---

This post is the instructions list I followed to install Gentoo on my new work laptop: an HP Folio 9470m. It's a mix of the official
[Installing Gentoo handbook](https://www.gentoo.org/doc/en/handbook/handbook-amd64.xml?part=1),
[@ultrabug](http://www.ultrabug.fr/)'s [french install
guide](http://www.ultrabug.fr/wiki/index.php5?title=Installer_Gentoo_Linux_simplement) and various resources I found while googling
for this specific laptop.

This is mostly intended to be a reminder to future-me, but I'd be more than happy if it's useful to someone else. If so, let me know
by writing a comment!

## Prepare the USB drive

- get the latest minimal install CD ISO from [http://distfiles.gentoo.org/releases/amd64/autobuilds/current-iso/](http://distfiles.gentoo.org/releases/amd64/autobuilds/current-iso/)
- put it on an USB drive with the help of [UNetbootin](http://unetbootin.sourceforge.net/)

## Boot on the LiveCD _(well, LiveUSB drive)_

- boot on the USB drive
- UNetbootin has a loader that allows you to choose what to boot, choose `gentoo`
- you briefly have the option to change your keyboard layout, type the number associated with the layout of your laptop before the
  default one (US) is loaded

Tip: if the default was loaded before you could change it, and want to get (e.g.) the french layout, type `loadkeys fr` once you are
in the shell.

## Set the date

Verify that your clock is correct by typing `date`.

If not, you can change it via:

```shell
date MMJJhhmmAAAA
```

## Configure Wifi

To verify that wpa_supplicant is available on your LiveCD, type `/etc/init.d/wpa_supplicant start`

You should get this kind of error:

```log
 * Starting WPA Supplicant Daemon
Successfully initialized wpa_supplicant
Failed to open config file 'etc/wpa_supplicant/wpa_supplicant.conf', error: No such file or directory
Failed to read or parse configuration '/etc/wpa_supplicant/wpa_supplicant.conf'.
 * start-stop-daemon: failed to start '/usr/sbin/wpa_supplicant'
 * Failed to start wpa_supplicant
 * ERROR: wpa_supplicant failed to start
```

It indicates that wpa_supplicant is installed and that you need to provide it with a valid config file.

Taking info from the [Gentoo handbook](http://www.gentoo.org/doc/en/handbook/handbook-x86.xml?part=4&chap=4), edit the following
file `/etc/wpa_supplicant/wpa_supplicant.conf`:

```ini
network={
  ssid="simple"
  psk="very secret passphrase"
}
```

Now retype `/etc/init.d/wpa_supplicant start` and you should see:

```log
 * Starting WPA Supplicant Daemon
Successfully initialized wpa_supplicant	[ok]
```

An `iwconfig` should show that you are connected to your SSID, and an `ifconfig` should show your IP address.

To verify that you really have Internet access, type `ping -c 3 www.google.com` to see the pings.

## Partition the disk

You will make a GPT disk here, and use the without-GUI-but-still-excellent gdisk utility. It allows for automatic partition
alignment. (see more [tips for maximizing SSD
performance](https://wiki.archlinux.org/index.php/Solid_State_Drives#Tips_for_Maximizing_SSD_Performance))

To enter the partition utility, type `gdisk /dev/sda`. Then:

- Print the existing partition table by typing `p`
- Delete all the existing partitions (if any). Type `d` and the partition number.
- Create the bios-boot partition by typing `n`, partition number by default (1), first sector by default (2048), last sector +2M,
  partition type ef02
- Create the boot partition by typing `n`, partition number by default (2), first sector by default (6144), last sector +512M,
  partition type by default (8300)
- Create the swap partition by typing `n`, partition number by default (3), first sector by default (1054720), last sector +8192M,
  partition type 8200
- Create the root partition by typing `n`, partition number by default (4), first sector by default (17831936), last sector by
  default (500118158 _if you have a 256MB SSD_), partition type by default (8300)
- Rename the boot partition by typing `c`, partition 2, name `boot`
- Rename the swap partition by typing `c`, partition 3, name `swap`
- Rename the root partition by typing `c`, partition 4, name `root`
- Print the partition table to verify it by typing `p`
- Write the partition table and quit by typing `w`, answer `y` at the warning

## Init the partitions

- Format the partitions

```shell
mkfs.ext2 /dev/sda2
mkfs.ext4 /dev/sda4
```

- Init and activate the swap

```shell
mkswap /dev/sda3
swapon /dev/sda3
```

- Now mount the partitions

```shell
mount /dev/sda4 /mnt/gentoo
mkdir /mnt/gentoo/boot
mount /dev/sda2 /mnt/gentoo/boot
```

All set, you'll now start to configure your final Gentoo system.

## Download stage3

You can choose the current stage3 here: [http://distfiles.gentoo.org/releases/amd64/autobuilds/current-stage3-amd64/](http://distfiles.gentoo.org/releases/amd64/autobuilds/current-stage3-amd64/)

Note the URL for the `stage3-amd64-YYYMMDD.tar.bz2` file

Tip: You are better off **not** choosing a nomultilib file if you want maximum compatibility.

Tip: You can choose a [closer mirror](http://www.gentoo.org/main/en/mirrors2.xml) to download the stage3.

```shell
cd /mnt/gentoo
wget URL_of_your_stage3_file
tar xpf stage3-*.tar.bz2
```

## Install a portage snapshot

To download and install the latest portage snapshot, the easiest way is to use `emerge-webrsync`.

## Prepare your Gentoo system

Before you chroot to your system, you need to prepare it first:

- copy the DNS info

```shell
cp -L /etc/resolv.conf /mnt/gentoo/etc/
```

- mount the filesystems

```shell
mount -o remount,nodev,nosuid -t tmpfs shm /dev/shm # to remount shm so you can use it as a temp dir for portage
mount -t proc proc /mnt/gentoo/proc
mount --rbind /sys /mnt/gentoo/sys
mount --rbind /dev /mnt/gentoo/dev
```

- now chroot in your new environment

```shell
chroot /mnt/gentoo /bin/bash
```

- adjust a few settings

```shell
env-update && source /etc/profile
export PS1="(chroot) $PS1"
```

_From now on, everything you do is in your final system, not on the LiveCD._

## Portage profile

The portage profile aims to pre-fill USE flags. Since this is a laptop and you want some graphical UI, choose the desktop profile.

First, type `eselect profile list` to see the list of available profiles.

Then type `eselect profile set X` where X is the desktop profile.

While you are at it, choose your Python version:

First, type `eselect python list` to see the list of available python versions.

Then type `eselect python set X` where X is the your prefered version.

## make.conf

This laptop has an Intel Core i7-3687U CPU. It's an IvyBridge and as of gcc-4.7, its `march` is `core-avx-i`.

So here is the content of `/etc/portage/make.conf`:

```ini
CHOST="x86_64-pc-linux-gnu"
CFLAGS="-march=core-avx-i -O2 -pipe"
CXXFLAGS="${CFLAGS}"

MAKEOPTS="-j3" # 2 cores

USE="bindist mmx sse sse2 -ipv6 -kde -gnome xinerama v4l -llvm -llvm-shared-libs"

PORTDIR="/usr/portage"
DISTDIR="${PORTDIR}/distfiles"
PKGDIR="${PORTDIR}/packages"

PORTAGE_TMPDIR="/dev/shm"

VIDEO_CARDS="intel i915" # despite being an IvyBridge, the video card is still an i915, not an i965
INPUT_DEVICES="synaptics evdev"
ALSA_CARDS="hda_intel"

ACCEPT_KEYWORDS="~amd64" # yes, we will accept unstable packages! Crazy us!
FEATURES="buildpkg" # keep a compiled version of packages for speedier further uses

EMERGE_DEFAULT_OPTS="--keep-going=y --quiet"
```

If you need to know which CFLAGS you should use with a different processor, you can go to the [Gentoo
wiki](http://wiki.gentoo.org/wiki/Safe_CFLAGS).

## Locales

You need to specify which locales you want on your system.

Here is the content of `/etc/locale.gen` enabling the use of US english and french locales:

```ini
en_US ISO-8859-1
en_US.UTF-8 UTF-8
fr_FR ISO-8859-1
fr_FR@euro ISO-8859-15
fr_FR.UTF-8 UTF-8
```

You then have to run `locale-gen` to generate all the specified locales.

Finaly, edit your `/etc/env.d/02locale` file to match your preferences. Here is mine, mostly french, apart from messages:

```ini
LANG="en_US.UTF-8"
LC_CTYPE="fr_FR.UTF-8"
LC_NUMERIC="fr_FR.UTF-8"
LC_TIME="fr_FR.UTF-8"
LC_COLLATE="fr_FR.UTF-8"
LC_MONETARY="fr_FR.UTF-8"
LC_MESSAGES="en_US.UTF-8"
LC_PAPER="fr_FR.UTF-8"
LC_NAME="fr_FR.UTF-8"
LC_ADDRESS="fr_FR.UTF-8"
LC_TELEPHONE="fr_FR.UTF-8"
LC_MEASUREMENT="fr_FR.UTF-8"
LC_IDENTIFICATION="fr_FR.UTF-8"
LC_ALL=""
```

Don't forget to set your timezone. Type these commands for Paris, France:

```shell
echo "Europe/Paris" > /etc/timezone
emerge --config sys-libs/timezone-data
```

If you live somewhere else, check `/usr/share/zoneinfo` for a list of all the supported timezones.

You should now reload your environment:

```shell
env-update && source /etc/profile
export PS1="(chroot) $PS1"
```

## First global update

Because you changed your portage profile and chose to enable unstable packages, it's good to launch a global update of the system.
All "mandatory" packages will thus be installed.

```shell
emerge --update --deep --with-bdeps=y --newuse @world
```

Following this big emerge, you'll probably have to run (check the end of the emerge log to see if other messages exist):

```shell
rc-update add kmod-static-nodes sysinit
```

Now that your system is updated, you can remove obsolete and unused packages

```shell
emerge --depclean
```

## Build your kernel

There is a very involving process where you can choose every single piece of code that goes into your kernel, and there is a simple
one, where you don't have to decide anything.

This is what you'll choose here, and because the `genkernel` tool takes its config from what was detected at the LiveCD boot, your
kernel will mostly be optimized for your laptop.

- First, grab the kernel sources and the `genkernel` util

```shell
emerge gentoo-sources genkernel
```

- Then copy the config used during the LiveCD boot to the file used by `genkernel`

```shell
zcat /proc/config.gz > /usr/share/genkernel/arch/x86_64/kernel-config
```

- Edit the `/etc/genkernel.conf` file:

  - find `MAKEOPTS` and set it to `-j3`
  - set the `TMPDIR` to `/dev/shm/tmp/genkernel`

- You can now launch the kernel building

```shell
genkernel all
```

If all succeeds, you'll see these 2 files in `/boot`: `kernel*` and `initramfs*`

## Configure the filesystem

Your partitions are listed in `/etc/fstab`. Gentoo provides a default file that is not valid and must be modified.

Based on the partitions you made earlier, here is what it should look like:

```log
/dev/sda2   /boot        ext2    defaults,noatime     0 2
/dev/sda3   none         swap    sw                   0 0
/dev/sda4   /            ext4    noatime,discard      0 1

shm         /dev/shm     tmpfs   nodev,nosuid         0 0
```

Note the `discard` option for our root partition: since it's on an SSD and the fs is ext4, this will enable the TRIM command.

Also: there is no cdrom drive on this laptop, so no need to write an entry in the fstab.

## Configure the network

First, define your hostname in `/etc/conf.d/hostname`

While you are at it, modify your `/etc/hosts` to fill your host name:

```ini
127.0.0.1    *your_host_name* localhost
```

Now, you will install and configure wpa_supplicant to enable wireless networking.

- install wpa_supplicant (with some other wireless utilities) by typing `emerge net-wireless/wpa_supplicant net-wireless/wireless-tools net-wireless/iw`

- as you did previously, edit the `/etc/wpa_supplicant/wpa_supplicant.conf` file:

```ini
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=wheel

network={
  ssid="simple"
  psk="very secret passphrase"
}
```

- now edit the `/etc/conf.d/net` file:

```ini
config_wlo1="dhcp" # wireless interface for this laptop. Run ifconfig to see yours.
config_enp0s25="dhcp" # lan interface for this laptop. Run ifconfig to see yours.
```

- and to automatically start networking at boot, type the following commands:

```shell
cd /etc/init.d
ln -s net.lo net.wlo1
ln -s net.lo net.enp0s25
rc-update add net.wlo1 default
rc-update add net.enp0s25 default
```

- for linux to be able to start the wireless interface, you need to install a microcode for it. This laptop needs the
  `sys-firmware/iwl6005-ucode` ebuild:

```shell
emerge sys-firmware/iwl6005-ucode
```

- finally, don't forget to install a dhcp client by typing `emerge dhcpcd`

## Configure keymap and hwclock

Some misc config now:

- edit the `/etc/conf.d/keymaps` file to reflect your keyboard
- edit the `/etc/conf.d/hwclock` file and set it to "UTC" "or "local" depending on your BIOS setting. If you came from or dual-boot
  with Windows, it will be "local".

## Change the root password

Just type `passwd`. This is the root password. You know what it means.

## Install some necessary system tools

- metalog will be your system logger. To install it, type `emerge metalog && rc-update add metalog default`.
- the cron daemon will be cronie. Type `emerge cronie && rc-update add cronie default`
- install a NTP daemon: `emerge ntp && rc-update add ntpd default`
- install [ACPI](http://wiki.gentoo.org/wiki/ACPI) (power button, fans, battery...): `emerge acpid && rc-update add acpid default`
- install some useful utils: `emerge gentoolkit portage-utils iproute2`
- want to use your mouse in the console? Install [gpm](https://wiki.gentoo.org/wiki/GPM) : `emerge gpm && rc-update add gpm default`
- to run SSH at boot: `rc-update add sshd default`

## Install a bootloader

- install GRUB2: `emerge sys-boot/grub`
- now install the necessary GRUB2 files in your boot disk: `grub2-install /dev/sda`
- generate the GRUB2 configuration: `grub2-mkconfig -o /boot/grub/grub.cfg`

## Reboot

Before you can reboot, you have to do some cleaning:

- type `exit` to exit the chroot
- get back to root by typing `cd`
- delete the stage3 and portage archives: `rm /mnt/gentoo/stage3-* && rm /mnt/gentoo/portage-latest*`
- unmount all the partitions

```shell
umount -l /mnt/gentoo/dev{/shm,/pts,}
umount -l /mnt/gentoo{/boot,/proc,/sys,}
```

- and now, unplug your USB drive and type `reboot`

You now have a working Gentoo distribution installed on your laptop. It's time to configure it further.

## Install X

- Install the X11 server:

```shell
emerge xorg-server
```

You will now configure some settings, like the keyboard layout or the touchpad functions.

First, if it does not exist already, create the `/etc/X11/xorg.conf.d` directory.

If you don't want to use the default (US) keyboard layout, create the `/etc/X11/xorg.conf.d/10-keyboard.conf` file, containing the
following:

```ini
Section "InputClass"
	Identifier		"Internal Keyboard"
	MatchIsKeyboard		"True"
	Option "XkbLayout"	"fr" # or whatever your layout is
EndSection
```

This laptop has a synaptics touchpad, so create the `/etc/X11/xorg.conf.d/50-synaptics.conf` file, containing:

```ini
Section "InputClass"
	Identifier				"Touchpad"
	Driver					"synaptics"
	MatchIsTouchpad			"True"
	Option "VertEdgeScroll"	"off"
	Option "TapButton1"		"1"
	Option "TapButton2"		"2"
	Option "TapButton3"		"3"
	Option "VertTwoFingerScroll"	"1"
	Option "HorizTwoFingerScroll"	"1"
EndSection
```

You can find the list of available options in the `man synaptics` page.

- Install a display manager: [SLiM](http://wiki.gentoo.org/wiki/SLiM)

```shell
emerge x11-misc/slim
```

Then set SLiM as your default display manager by setting `DISPLAYMANAGER="slim"` in `/etc/conf.d/xdm`

You'll need to modify the `/etc/slim.conf` file to set the `login_cmd` to the line `login_cmd exec /bin/bash -login ~/.xinitrc %session` and comment the 2 others.

To start SLiM at boot, add xdm to your default runlevel: `rc-update add xdm default`

Debug tip for later: if when you login with SLiM, it seems that [no Window Manager is
loading](http://wiki.gentoo.org/wiki/SLiM#Failed_to_connect_to_socket_.2Fvar.2Frun.2Fdbus.2Fsystem_bus_socket:), type: `rc-update add dbus default`

- Install [i3](http://i3wm.org/)

```shell
emerge x11-wm/i3 i3status
```

Then edit your `~/.xinitrc` to be just: `exec i3`

- Install a terminal

```shell
emerge terminator
```

## Verify the webcam

To test the webcam, use mplayer (emerge it before):

```shell
mplayer tv:// -tv driver=v4l2:device=/dev/video0
```

If you are in an X session, your video should show. Otherwise, you should see a frame counter rolling. That's good.

## Get sound

Install alsa-utils

```shell
emerge alsa-utils && rc-update add alsasound default
```

If you don't get any sound, launch `alsamixer` to unmute (type `m`)

## That's it... for now!

Everything should work now - mostly. Of course, there is still some tweaking left!

In an upcoming post, I'll detail the exact config files I used for this hardware, including for the kernel.
