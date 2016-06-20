---
layout: post
title: "Python tests on virtual Mac OS X with Vagrant and py.test"
description: "How to set up a virtual Mac and run your Python tests in it directly from your Linux host"
category: 
tags: [Python]
---
{% include JB/setup %}

Why to run tests on Mac?
------------------------

Although I am a proud Fedora user, I write my Python projects and I want them to run on multiple
operating systems including Mac OS X. While there are already options available to [run the tests on
Mac OS X in Trvais CI](https://docs.travis-ci.com/user/multi-os/#Python-example-(unsupported-languages))
or similar tool, I sometimes like to run my tests locally. If you like to do the same, read further.

Getting Mac OS X
----------------

In the past, I've managed to manually install some hacked version of Mac OS X Mavericks into
VirtualBox and SSH into it from my Fedora host. I've used that virtual machine a lot to test my projects.
However, the way of installing it was not very straight-forward. Recently
[@Syky27](https://twitter.com/syky27) showed me that I can set up a virtual Mac OS X using Vagrant,
in an automated fashion.

First you'll need [Vagrant](https://www.vagrantup.com/). On Fedora, you can use the one packaged in
the distribution and just do `dnf install vagrant`. I've used VirtualBox provider for it, because
I think that it won't work with libvirt, the default Vagrant provider in Fedora. In fact I didn't
even bother trying, so in case you'll try it and it works, let me know. To get VirtualBox on Fedora,
I recommend the [RPM Fusion repository](http://rpmfusion.org/). You'll also need the Oracle VM VirtualBox Extension Pack.
I will not go into details, as I'm
quite confident you are capable of installing VirtualBox yourselves :)

Once you have both Vagrant and VirtualBox, create an empty folder somewhere where you can find it.
In that folder, run the following:

    vagrant init jhcook/osx-elcapitan-10.11

This will simply fetch a `Vagrantfile`. It is quite fast. Once done, run:

    vagrant up --provider virtualbox

For the first time this will download the image of Mac OS X and boot it. For next time, it will
simply start the virtual machine. The download may take a few hours.

Once your machine is up and running, you can SSH into it with `vagrant ssh` (from the same folder).

Installing Python
-----------------

There might be multiple ways of installing recent Python version into your virtual Mac, but for me,
using Homebrew was the best shot. First, get [Homebrew](http://brew.sh/), that allows you to install
Python as easily as this:

    brew install python3

(Now you've noticed I use Python 3. If you want to use legacy Python, also install it from Homebrew,
don't use the built-in one that it shipped with Mac OS X, it might not work.)

At this point, you should be able to use `python3`, `pip3` and `pyvenv` commands. In case you need
some dependencies, feel free to install them with `pip3 install --user foo`. In case you'll use this
for multiple projects, it might be a good idea to put stuff into virtualenvs:

    pyvenv myenv
    . myenv/bin/activate
    pip install foo

**Note:** You don't need py.test to be present on the Mac.

Running your tests on Mac, from your Linux, without pain
--------------------------------------------------------

In order to be able to SSH to your virtual Mac from anywhere, we ask Vagrant for the SSH config (we are back on our main system now):

    vagrant ssh-config | awk '{print "    "$1" "$2}'

Put that into your `~/.ssh/config`, it will look similar to this:

    Host mac
        HostName 127.0.0.1
        User vagrant
        Port 2222
        UserKnownHostsFile /dev/null
        StrictHostKeyChecking no
        PasswordAuthentication no
        IdentityFile "/home/username/.vagrant.d/insecure_private_key"
        IdentitiesOnly yes
        LogLevel FATAL

Don't forget the first line. You can test your connection by using `ssh mac` from any PWD.

Now you'll need to grab an excellent plugin for py.test, [pytest-xdist](https://pypi.python.org/pypi/pytest-xdist)
that lets you execute your tests remotely over SSH (among plenty other things).

From your project directory, execute your tests with py.test as you would normally do, with some extra options:

    py.test-3 -d --tx 'ssh=mac//python=/usr/local/bin/python3' --rsyncdir modname modname

*modname* here is your main module directory you want to sync to Mac in order to run your tests.
In case your tests are not inside that directory, add them as well (as well as any other directories you need):

    py.test-3 -d --tx 'ssh=mac//python=/usr/local/bin/python3' --rsyncdir modname modname --rsyncdir test test

In case you want to use your virtualenv, modify the command a bit:

    py.test-3 -d --tx 'ssh=mac//python=myenv/bin/python' ...

Now you should be able to see your testsuite running on Mac.

To stop the running virtual machine, execute either `vagrant suspend` or `vagrant halt` from the folder where you started it.

Next steps?
-----------

This is very raw how-to of something I just managed to do. I might look into automating this somehow.
Also, it might be a great idea to combine this with another great py.test plugin, [testom](http://testmon.org/).
