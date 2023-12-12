---
title: MacOS Recovery
authors: hsiao
tags: [mac]
---

Recently a colleague accidentally changed their Mac system settings
through `/etc/synthetic.conf`. This caused the collegue could not even
login into the Mac with any account.

We then found the following mac recovery steps from the Apple Website:

[https://support.apple.com/en-us/102603](https://support.apple.com/en-us/102603)

In case this page may disappear in the future:

* With Apple Silicon:
    * Turn on your Mac and continue to press and hold the power button as your Mac starts up.
    * Release the power button when you see the startup options screen, which shows your startup disks and a gear icon labeled Options.
    * From this window you can start up from a different disk, start up in safe mode, use macOS Recovery, and more.
* With Intel-based Mac:
    * Command (⌘)-R: Start up from the built-in macOS Recovery system.
    * Option (⌥) or Alt: Start up to Startup Manager, which allows you to choose other available startup disks or volumes.
    * Option (⌥)-Command (⌘)-P-R: Reset NVRAM or PRAM.
    * Shift (⇧): Start up in safe mode.
    * T: Start up in target disk mode.

The Mac is a 2014 Intel-based Mac. We use Command (⌘)-R to get into the built-in macOS Recovery system.
In addition, we connected an external-drive to the Mac. We were able to:
* Select this external-drive as the target disk.
* Install MacOS on this external-drive.
* Reboot the Mac through this external-drive.
* Found the `/etc/synthetic.conf` in the internal disk and `rm /etc/synthetic.conf`.
