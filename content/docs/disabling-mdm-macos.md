---
title: Disable MDM on Mac OS
author: Kuon
date: 2025-01-20
tags: [english, tips, mac, mdm]
---

Note: This is applicable to Big Sur and newer.

There are several ways to disable MDM on Mac OS. If you don't know what they are, you can do a quick search on Google.

Anyway this is what needed to be done: Edit `hosts` file:

```bash
sudo nano /private/etc/hosts
```

(You might be asked for your password)

Then append these lines:

```
0.0.0.0 iprofiles.apple.com // [!code ++]
0.0.0.0 mdmenrollment.apple.com
0.0.0.0 deviceenrollment.apple.com
0.0.0.0 gdmf.apple.com
```

And DO NOT append this line:

```
0.0.0.0 albert.apple.com
```
