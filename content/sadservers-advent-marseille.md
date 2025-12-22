+++
aliases = ["posts/sadservers-advent-marseille/"]
title = "Marseille - Advent of Sysadmin 2025 - 12/02"
date = 2025-12-02
[taxonomies]
tags = ["devops", "ctf"]
+++

> This is part of Sad Servers' [Advent of Sysadmin 2025](https://sadservers.com/advent) series.
>
> I'm doing each challenge every day and I'm publishing a quick write up for each one every day.
>
> 12-02: LAMP stack configuration
>
> Spoiler alert! This gives the solution to the challenge.
> If you want to do it on your own, stop reading.

---

**Scenario:** "Marseille": Rocky security

**Level:** Medium

**Type:** Fix

**Tags:** [apache](https://sadservers.com/tag/apache)   [php](https://sadservers.com/tag/php)   [advent2025](https://sadservers.com/tag/advent2025)

**Access:** Email

**Description:** As the Christmas shopping season approaches, the security team has asked Mary and John to implement more security measures. Unfortunately, this time they have broken the LAMP stack; the frontend is unable get an answer from upstream, thus they need your help again to fix it.

The application should be able to serve the content from the webserver.

**Note for Pro users:** direct SSH access is not available (yet) for this scenario.

**Root (sudo) Access:** True

**Test:** curl localhost | head -n1 returns SadServers - LAMP Stack

The "Check My Solution" button runs the script _/home/admin/agent/check.sh_, which you can see and execute.

**Time to Solve:** 15 minutes.

---

This one took me a bit more time than usual. Let's start from the beginning. What do we know?

- We have a frontend and some kind of upstream server
- It's a [LAMP stack](<https://en.wikipedia.org/wiki/LAMP_(software_bundle)>) - probably apache and php from looking at the tags
- The name of the challenge points toward something about the security on Rocky linux

Let's see what's running on the machine:

```bash
sudo netstat -anp | grep -E "php|httpd"
tcp        0      0 127.0.0.1:9000          0.0.0.0:*               LISTEN      934/php-fpm: master
tcp6       0      0 :::80                   :::*                    LISTEN      966/httpd
unix  3      [ ]         STREAM     CONNECTED     9946     966/httpd
unix  3      [ ]         STREAM     CONNECTED     10037    934/php-fpm: master
unix  3      [ ]         STREAM     CONNECTED     10036    934/php-fpm: master
unix  2      [ ACC ]     STREAM     LISTENING     10250    993/httpd            /etc/httpd/run/cgisock.966
unix  3      [ ]         STREAM     CONNECTED     9085     934/php-fpm: master
unix  2      [ ]         DGRAM                    10249    966/httpd
```

So as we see here, we have apache and php-fpm running. apache is listening on port 80 and php-fpm on port 9000.

They are both running as systemd services:

```bash
[admin@i-0e0450878ee67b460 ~]$ ps -eo pid,comm,cgroup | grep -E "php|httpd"
    934 php-fpm         0::/system.slice/php-fpm.service
    966 httpd           0::/system.slice/httpd.service
    988 php-fpm         0::/system.slice/php-fpm.service
    989 php-fpm         0::/system.slice/php-fpm.service
    990 php-fpm         0::/system.slice/php-fpm.service
    991 php-fpm         0::/system.slice/php-fpm.service
    992 php-fpm         0::/system.slice/php-fpm.service
    993 httpd           0::/system.slice/httpd.service
    994 httpd           0::/system.slice/httpd.service
    995 httpd           0::/system.slice/httpd.service
   1028 httpd           0::/system.slice/httpd.service
```

What do we get when poking those services?

```bash
[admin@i-0e0450878ee67b460 ~]$ curl -v localhost
* Host localhost:80 was resolved.
* IPv6: ::1
* IPv4: 127.0.0.1
*   Trying [::1]:80...
* connect to ::1 port 80 from ::1 port 45164 failed: Connection refused
*   Trying 127.0.0.1:80...
* connect to 127.0.0.1 port 80 from 127.0.0.1 port 48662 failed: Connection refused
* Failed to connect to localhost port 80 after 0 ms: Could not connect to server
* closing connection #0
curl: (7) Failed to connect to localhost port 80 after 0 ms: Could not connect to server

[admin@i-0e0450878ee67b460 ~]$ curl -v localhost:9000
* Host localhost:9000 was resolved.
* IPv6: ::1
* IPv4: 127.0.0.1
*   Trying [::1]:9000...
* connect to ::1 port 9000 from ::1 port 43394 failed: Connection refused
*   Trying 127.0.0.1:9000...
* Connected to localhost (127.0.0.1) port 9000
* using HTTP/1.x
> GET / HTTP/1.1
> Host: localhost:9000
> User-Agent: curl/8.12.1
> Accept: */*
>
* Request completely sent off
* Recv failure: Connection reset by peer
* closing connection #0
curl: (56) Recv failure: Connection reset by peer
```

Both returns a connection refused. Let's look at the configuration files.

Going through `/etc/`, I found the defaults config file for apache:

```bash
[admin@i-0e0450878ee67b460 ~]$ ls -lah /etc/httpd/conf.d/
total 24K
drwxr-xr-x. 2 root root  122 Dec  2 02:52 .
drwxr-xr-x. 5 root root  105 Dec  2 02:52 ..
-rw-r--r--. 1 root root  157 Dec  2 02:52 000-default.conf
-rw-r--r--. 1 root root 2.9K Aug 16 00:00 autoindex.conf
-rw-r--r--. 1 root root 1.6K Apr  9  2025 php.conf
-rw-r--r--. 1 root root  400 Aug 16 00:00 README
-rw-r--r--. 1 root root 1.3K Aug 16 00:00 userdir.conf
-rw-r--r--. 1 root root  653 Aug 16 00:00 welcome.conf

[admin@i-0e0450878ee67b460 ~]$ cat /etc/httpd/conf.d/000-default.conf
<VirtualHost *:80>
    DocumentRoot /var/www/html

    <FilesMatch \.php$>
        SetHandler "proxy:fcgi://127.0.0.1:9001"
    </FilesMatch>
</VirtualHost>
```

There, I spotted the issue with the port: 9001 is not the right php port! It should be 9000.

Let me fix it:

```bash
vi /etc/httpd/conf.d/000-default.conf
# Change this line:
#   SetHandler "proxy:fcgi://127.0.0.1:9001"
# To:
#   SetHandler "proxy:fcgi://127.0.0.1:9000"

# Restart apache for changes to take effect
sudo systemctl restart httpd
```

Then, the frontend was returning something else!

```bash
[admin@i-0e0450878ee67b460 ~]$ curl -v localhost
* Host localhost:80 was resolved.
* IPv6: ::1
* IPv4: 127.0.0.1
*   Trying [::1]:80...
* Connected to localhost (::1) port 80
* using HTTP/1.x
> GET / HTTP/1.1
> Host: localhost
> User-Agent: curl/8.12.1
> Accept: */*
>
* Request completely sent off
< HTTP/1.1 503 Service Unavailable
< Date: Tue, 09 Dec 2025 21:02:54 GMT
< Server: Apache/2.4.63 (Rocky Linux)
< Content-Length: 299
< Connection: close
< Content-Type: text/html; charset=iso-8859-1
<
<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head>
<title>503 Service Unavailable</title>
</head><body>
<h1>Service Unavailable</h1>
<p>The server is temporarily unable to service your
request due to maintenance downtime or capacity
problems. Please try again later.</p>
</body></html>
* shutting down connection #0
```

Interestingly, we actually get a response back. Still, a 503, but better than what we had when we started!

This is where it took me some digging to find the next issue. I was not super familiar with Rocky linux. I ended up reading a lot on [SELinux Security - Documentation](https://docs.rockylinux.org/10/guides/security/learning_selinux/)

I grep'ed some logs in `/var/log/audit/audit.log`, looking for anything related to httpd.

```bash
[admin@i-0e0450878ee67b460 ~]$ grep "httpd" /var/log/audit/audit.log
type=AVC msg=audit(1765314669.764:122): avc:  denied  { name_connect } for  pid=1001 comm="httpd" dest=9000 scontext=system_u:system_r:httpd_t:s0 tcontext=system_u:object_r:http_port_t:s0 tclass=tcp_socket permissive=0
type=SYSCALL msg=audit(1765314669.764:122): arch=c000003e syscall=42 success=no exit=-13 a0=e a1=7f4ddc011e68 a2=10 a3=7f4dea7e394c items=0 ppid=970 pid=1001 auid=4294967295 uid=48 gid=48 euid=48 suid=48 fsuid=48 egid=48 sgid=48 fsgid=48 tty=(none) ses=4294967295 comm="httpd" exe="/usr/sbin/httpd" subj=system_u:system_r:httpd_t:s0 key=(null)ARCH=x86_64 SYSCALL=connect AUID="unset" UID="apache" GID="apache" EUID="apache" SUID="apache" FSUID="apache" EGID="apache" SGID="apache" FSGID="apache"
type=AVC msg=audit(1765314670.245:123): avc:  denied  { name_connect } for  pid=1000 comm="httpd" dest=9000 scontext=system_u:system_r:httpd_t:s0 tcontext=system_u:object_r:http_port_t:s0 tclass=tcp_socket permissive=0
type=SYSCALL msg=audit(1765314670.245:123): arch=c000003e syscall=42 success=no exit=-13 a0=e a1=7f4dd8011e68 a2=10 a3=7f4de1bfd94c items=0 ppid=970 pid=1000 auid=4294967295 uid=48 gid=48 euid=48 suid=48 fsuid=48 egid=48 sgid=48 fsgid=48 tty=(none) ses=4294967295 comm="httpd" exe="/usr/sbin/httpd" subj=system_u:system_r:httpd_t:s0 key=(null)ARCH=x86_64 SYSCALL=connect AUID="unset" UID="apache" GID="apache" EUID="apache" SUID="apache" FSUID="apache" EGID="apache" SGID="apache" FSGID="apache"

```

This was very hard to read and didn't give me much info. Basically, httpd was denied access to port 9000. But why?

But then I learned about `audit2why` and the magic happened:

```bash
[admin@i-0e0450878ee67b460 ~]$ sudo grep "httpd" /var/log/audit/audit.log | grep "avc" | tail -1 | audit2why
type=AVC msg=audit(1765319188.541:316): avc:  denied  { name_connect } for  pid=1041 comm="httpd" dest=9000 scontext=system_u:system_r:httpd_t:s0 tcontext=system_u:object_r:http_port_t:s0 tclass=tcp_socket permissive=0

        Was caused by:
        One of the following booleans was set incorrectly.
        Description:
        Allow httpd to can network connect

        Allow access by executing:
        # setsebool -P httpd_can_network_connect 1
        Description:
        Allow httpd to graceful shutdown

        Allow access by executing:
        # setsebool -P httpd_graceful_shutdown 1
        Description:
        Allow httpd to can network relay

        Allow access by executing:
        # setsebool -P httpd_can_network_relay 1
        Description:
        Allow nis to enabled

        Allow access by executing:
        # setsebool -P nis_enabled 1

```

Now this is way more readable! Reading on the first boolean, httpd_can_network_connect, I felt like I had a high chance of success: [13.3. Booleans | SELinux User's and Administrator's Guide | Red Hat Enterprise Linux | 7 | Red Hat Documentation](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/selinux_users_and_administrators_guide/sect-managing_confined_services-the_apache_http_server-booleans)

> `httpd_can_network_connect`
> When disabled, this Boolean prevents HTTP scripts and modules from initiating a connection to a network or remote port. Enable this Boolean to allow this access.

Since we have httpd getting blocked when doing a request, that seems to match our case.

Let's try it:

```bash
[admin@i-0e0450878ee67b460 ~]$ sudo setsebool -P httpd_can_network_connect 1
[admin@i-0e0450878ee67b460 ~]$ curl localhost | head -n1
[...]
SadServers - LAMP Stack

```

And success! 🚩
