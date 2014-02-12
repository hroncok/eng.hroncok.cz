---
layout: post
title: "State of Python 3 as default in Fedora"
description: "What's needed to be done to have Python 3 shipped as the default Python in Fedora"
category: 
tags: [Python, Fedora, cloud]
---
{% include JB/setup %}

First of all, if you don't know anything about Python 3 in Fedora, go read [this](https://fedoraproject.org/wiki/Changes/Python_3_as_Default) before you go any further.

OK, now when you have read it (you have, right?), let me try to explain what's needs to be done first and what's blocking us. There is [this gigantic table of packages that need to be ported to Python 3](https://fedoraproject.org/wiki/User:Churchyard/python3) - that means ship both 2 and 3 subpackages for modules, or use Python 3 interpreter for apps. From that, you can see what packages need some love. But it doesn't show what is important and what should be targeted first.

Cloud
-----

You may be surprised that cloud is my first topic. The thing is, cloud images of Fedora need to be as small as possible. They simply cannot ship both Pythons. While in other use cases we might be able to ship Python 2 as well as Python 3 with the default installation, cloud is not that case. The most important thing within cloud is [cloud-init](https://bugs.launchpad.net/cloud-init/+bug/1247132). It has two major deps that need to be ported first: [boto](https://github.com/boto/boto/issues/677) and templating system.

Boto is somehow ported to Python 3 in a [GitHub repo by one individual](https://github.com/kurin/boto/tree/py3kport) and it doesn't follow upstream releases. It also requires an old version of HTTPretty that somehow did work with Python 3 (probably by accident). However, [HTTPretty now gets Python 3 support in newer versions](https://github.com/gabrielfalcao/HTTPretty/pull/143). So in some time, this might be solved by upstream (if we ask them politely once in a while).

cloud-init templating system is the real problem. Cloud-init uses [Cheetah](http://www.cheetahtemplate.org/) and that is very old and probably dead, latest release is from 2010 and the documentation talks about Python 2.3. Porting that thing to Python 3 is probably not an option (and if you don't think so, look at the code). So for cloud-init to be ported to Python 3 and for other reasons, [changing the templating system was proposed](https://bugs.launchpad.net/cloud-init/+bug/1219223). However, upstream wants 100 % backward compatibility with Cheetah templates and that's not gonna happen magically. So adding a compat layer between some other templating system, that has a similar syntax as Cheetah (such as [Mako](http://docs.makotemplates.org/en/latest/usage.html#basic-usage)) would help a lot. Good starting point for you, if you want to push thing forward.

Yum, DNF and friends
--------------------

Yum won't be ported to Python 3. We'll ship DNF instead (maybe renamed to Yum). DNF should run with Python 3 just fine, but we'll have to wait until it's suitable as default. We cannot drop Python 2 from default installation while having Yum in as a default installer. According to upstream, [PackageKit should be Python 3 compatible when it drops Yum backend](https://bugzilla.redhat.com/show_bug.cgi?id=1014559#c3), but as we see it, there are still some [things that need to be ported](https://bugs.freedesktop.org/show_bug.cgi?id=66992).

Anaconda
--------

And I'd say this is the last big thing that needs to be ported before we can drop Python 2 from default installation. Anaconda has a long list of dependencies (most of them are part of Anaconda project) that need to be ported. Anaconda developers are slowly working towards Python 3, but they have lots of other tasks on their shoulders and helping them would be nice. Porting [authconfig](https://bugzilla.redhat.com/show_bug.cgi?id=984907) looks like a good place to start as it's developer clearly stated that he has no time to do it.
