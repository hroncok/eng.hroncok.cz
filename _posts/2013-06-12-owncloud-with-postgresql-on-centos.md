---
layout: post
title: "ownCloud with PostgreSQL on CentOS"
description: "(Not exactly) a how-to about installing ownCloud with PostgreSQL on CentOS"
category: 
tags: [CentOS, PostgreSQL, ownCloud, EPEL]
---
{% include JB/setup %}

**Note:** This post is kind of a hybrid between a how-to and a story, about hove I have it done. You probably won't need to do it all stop by step. If you are reading this, because you actually want to install ownCloud with PostgreSQL on CentOS, read the text first and try it after you've read it all.

Background
----------

*You can skip this part, if you just want the how-to.*

At our [3D printing lab at the university](http://3dprint.fit.cvut.cz/), we share 3D models and [G-codes](https://en.wikipedia.org/wiki/G-code) a lot. G-codes for 3D printing are usually to large for e-mail attachments, so it basically always ends up with USB stick. This drives me crazy, because we are the [Faculty of Information Technology](http://fit.cvut.cz/en) and we are unable to bring a long term solution to a simple problem.

Once, we had a server with SSH (ant therefore SFTP) access - but it was a mess and we always got some problems with permissions. We can also use some ready-to-use solution, such as Dropbox, but I don't like it - I can either synchronize the files, or use web interface. I would prefer a tool, that also allows me to simply connect the storage, let's say via WebDAV.

That's bring me to [ownCloud](http://owncloud.org/), that supports all this - syncing files, mounting the storage and web interface. And speaking about Dropbox, ownCloud should be able to connect Dropbox as an external storage. I've heard a lot about this tool and I want to give it a try for a long time.

In our lab, we have several old computers and at least one of them should serve as a server just fine. e also have a lot of hard drives that should serve as RAID pool. It has been ages since I installed a server for some service and in that times, I used Debian stable. Right now, when I am Fedorian and Red Hatter, I've decided for CentOS. I have never tried it yet but what the hell, it has `yum`. At least I can recall [ownCloud is a feature for Fedora 19](http://fedoraproject.org/wiki/Features/OwnCloud) and the packages are available for EPEL (therefore for CentOS).

VirtalBox
---------

*Yes, you can skip this part too :)*

I decided to try the thing first in the virtual machine in VirtualBox, so I don't screw anything up. I use VirtualBox a lot for trying several desktops, but I never used it to virtualise a server. The only thing that is important is to set the network mode to **Bridged networking**, so you can get an real IP address that is available from your local network.

Getting started with CentOS
---------------------------

*And finally, if your CentOS server already works, you can skip this too.*

I've installed CentOS from the minimal installation media. The installation was really fast and I believe the only thing I got was kernel, networking and yum. First, you have to run `dhclient` to get an IP address. It is really a good idea to enable automatic connecting on boot, or you'll need physical access to the machine after each reboot (not a big issue when running the server from VirtualBox, but in production). You'll do that by enabling it in `/etc/sysconfig/network-scripts/ifcfg-eth0` (or similar) - set `ONBOOT` option to `yes`.

SSH server was already installed, I recommend to use only keys to log in, by using this config in `/etc/ssh/sshd_config`:

    PermitRootLogin no
    PubkeyAuthentication yes
    AuthorizedKeysFile .ssh/authorized_keys
    RSAAuthentication no
    PasswordAuthentication no
    UsePAM no
    KerberosAuthentication no
    GSSAPIAuthentication no

Be sure to create an user and to have key authorization working for him before you disable root access and password logins. Simple copying my public key to the server's user's `.ssh/authorized_keys` didn't work, CentOS needs you to set permissions correctly:

    chmod 700 ~/.ssh
    chmod 600 ~/.ssh/authorized_keys

Also, I've run `yum update` to get the updates.

### Adding EPEL

To install ownCloud form EPEL repository, you need to have EPEL installed and enabled in your system. Get the [link for the latest version of epel-release](http://download.fedoraproject.org/pub/epel/6/i386/repoview/epel-release.html) and install it with `yum`.

    yum install http://.../pub/linux/fedora/epel/6/i386/epel-release-6-8.noarch.rpm

I also recommend to install the package `bash-completion` from EPEL - otherwise the work with `yum` and other tools is pain.

Installing ownCloud
-------------------

[Fedora ownCloud feature page](http://fedoraproject.org/wiki/Features/OwnCloud) says:

    No manual configuration should be required and if, make sure all steps are correctly described in a README.Fedora

So I've installed the `owncloud` package and looked in README.Fedora.

    yum install owncloud
    cat /usr/share/doc/owncloud-4.5.11/README.fedora
    ...

This README says several things:

    After installation you should be able to access the login/configuration page
    on following url:

    http://localhost/owncloud/ or http://localhost/

And yes indeed (not sure but probably after starting the server with `service httpd start`) it servers something, but only from local connection:

    yum install lynx
    lynx http://localhost/owncloud/

That works, but accessing ownCloud from my host didn't work.

    Currently ownCloud in Fedora supports following webserver: httpd and nginx.
    You must install at least on webserver subpackage (owncloud-webserver). These
    packages include additional configuration files for the webservers. Note that
    these files are just samples. For production setup you should adjust them to
    your needs. Also remote access is disabled by default.

Yes, exactly. I've observed, that `owncloud-httpd` package was installed with `owncloud`. As I have no experience with nginx configuration, I decided to keep it that way. I've looked to `/etc/httpd/conf.d/owncloud.conf` and changed this part:

        <IfModule mod_authz_core.c>
        # Apache 2.4
        Require local
        </IfModule>
        <IfModule !mod_authz_core.c>
        # Apache 2.2
        Order Deny,Allow
        Deny from all
        Allow from 127.0.0.1
        Allow from ::1
        </IfModule>

To:

        Order Allow,Deny
        Allow from all

And restarted Apache with `service httpd restart`. To allow remote access. Sadly, it wan't enough. Iptables are running be default on CentOS and I had to enable TCP traffic on ports 80 and 443.

    iptables -I INPUT -p tcp -m tcp --dport 80 -j ACCEPT
    iptables -I INPUT -p tcp -m tcp --dport 443 -j ACCEPT
    service iptables save

After that, I was able to visit ownCloud page from remote computer (in this case, the virtualization host).

Configuring PostgreSQL
----------------------

    You can choose between 3 databases: MySQL, Postgresql and SQLite.
    For each of them exists a corresponding owncloud subpackage (owncloud-database).
    You are required to install at least one of them.

    For larger installs you should use MySQL or PostgreSQL.

    If you choose MySQL or PostgreSQL, keep in mind that you must create a database and user
    for owncloud manually, before you can finish the setup process.

    For specific instructions, please refer to the documentation in the database subpackages.

Together with `owncloud-httpd` I've also got `owncloud-mysql`. But my personal preferences are for PostgreSQL, so I wanted `owncloud-postgresql` instead. I didn't want anything from MySQL to be left behind, so I undid the installation of ownCloud with `yum history undo X` and installed again `yum install owncloud-postgresql`. After that, I've looked to the documentation in the database subpackage.

    cat /usr/share/doc/owncloud-postgresql-4.5.11/README.postgresql 
    Configure PostgreSQL for ownCloud
    =================================
    Before you can use PostgreSQL as database backend, you need to follow a couple of steps:

    1. make sure that your PostgreSQL service is configured and running properly
    2. log in to PostgreSQL as system user to create the database and a dedicated user account for ownCloud:
    su - -c "psql" postgres
     CREATE USER username WITH PASSWORD 'password';
     CREATE DATABASE owncloud TEMPLATE template0 ENCODING 'UNICODE';
     ALTER DATABASE owncloud OWNER TO username;
     GRANT ALL PRIVILEGES ON DATABASE owncloud TO username;

    Choose identifier and password accordingly.

    Now you can launch the ownCloud setup screen, select PostgreSQL in the advanced settings and fill in your credentials.

On CentOS, to configure and run PostgreSQL you have to do:

    service postgresql initdb # initialize
    service postgresql start  # start it now
    chkconfig postgresql on   # start it always

After that, you can run `su - -c "psql" postgres` and create the database and user with commands in `README.postgresql`. The only problem is, you won't be able to connect to PostgreSQL form ownCloud, unless you enable password anesthetization in `/var/lib/pgsql/data/pg_hba.conf`:

    # TYPE  DATABASE    USER        CIDR-ADDRESS          METHOD

    # "local" is for Unix domain socket connections only
    local   all         all                               ident
    # IPv4 local connections:
    host    all         all         127.0.0.1/32          md5
    # IPv6 local connections:
    host    all         all         ::1/128               md5

Changed thing is in last column - for connection form localhost (both IPv4 and IPv6) it now uses md5 hashes of passwords to authenticate the user. After the change, restart PostgreSQL with `service postgresql restart`.

That should be it, but SELinux protects you and therefor you cannot connect to the PostgreSQL database from ownCloud. The following command should enable it:

    setsebool -P httpd_can_network_connect_db 1

Disabling SELinux enables it as well. To disable it now (until reboot), run `echo 0 >/selinux/enforce`, to disable it forever after next reboot, set `SELINUX` option to `disabled` in `/etc/selinux/config`. Disabling SELinux should be the last option (but it usually helps with a lot of things).

Custom ownCloud data directory
------------------------------

    The default data directory is '/var/lib/owncloud/data'. Every file that is uploaded
    by your users to ownCloud gets saved into this folder. Consider doing a backup of this
    directory, together with the database and the main configuration.

As I intend to keep user data in `/home`, I wanted to change this. It is not very difficult, you are asked for the directory on the ownCloud setup page.

First, you have to create the directory and set the permissions correctly:

    [root@centos ~]# mkdir -p /home/owncloud/
    [root@centos ~]# ls -ld /var/lib/owncloud/data/
    drwxr-x---. 2 apache apache 4096 Jun 10 20:12 /var/lib/owncloud/data/
    [root@centos ~]# chown apache:apache /home/owncloud/
    [root@centos ~]# chmod 750 /home/owncloud/
    [root@centos ~]# ls -ld /home/owncloud/
    drwxr-x---. 3 apache apache 4096 Jun 10 20:57 /home/owncloud/

But, ownCloud would keep telling you it cannot writes to that directory. If you don't know, what's causing the problem, blame SELinux :) And again, it protects you and it doesn't allow ownCloud to write anywhere it thinks it should. Sou you have to allow it (or disable SELinux).

    chcon -t httpd_sys_rw_content_t /home/owncloud

After that, I was able to fill the setup page of ownCloud and it worked. Sadly, I was not able to make the Dropbox sync working (yet).
