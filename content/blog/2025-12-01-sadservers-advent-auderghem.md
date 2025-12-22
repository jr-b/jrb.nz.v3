+++
title = "Auderghem - Advent of Sysadmin 2025 - 12/01"
date = 2025-12-01
[taxonomies]
tags = ["devops", "ctf"]
+++

> This is part of Sad Servers' [Advent of Sysadmin 2025](https://sadservers.com/advent) series.
>
> I'm doing each challenge every day and I'm publishing a quick write up for each one every day.
>
> 12-01: Docker/nginx misconfiguration
>
> Spoiler alert! This gives the solution to the challenge.
> If you want to do it on your own, stop reading.

---

**Scenario:** "Auderghem": Containers miscommunication

**Level:** Medium

**Type:** Fix

**Tags:** [nginx](https://sadservers.com/tag/nginx)

**Access:** Email

**Description:** There is an nginx Docker container that listens on port 80, the purpose of which is to redirect the traffic to two other containers *statichtml1* and *statichtml2* but this redirection is not working.  
Fix the problem.

**IMPORTANT.** You can restart all containers, but don't **stop** or **remove** them.

**Root (sudo) Access:** True

**Test:** The nginx container must redirect the traffic to the statichtml1 and statichtml2 containers:

curl http://localhost returns the Welcome to nginx default page  
curl http://localhost/1 returns HelloWorld;1  
curl http://localhost/2 returns HelloWorld;2

The "Check My Solution" button runs the script */home/admin/agent/check.sh*, which you can see and execute.

**Time to Solve:** 15 minutes.

---

First of all, we need to know what we're working with. Let's explore the errors and the docker containers running:

```bash
curl -v http://localhost/1
* Host localhost:80 was resolved.
* IPv6: ::1
* IPv4: 127.0.0.1
*   Trying [::1]:80...
* Connected to localhost (::1) port 80
* using HTTP/1.x
> GET /1 HTTP/1.1
> Host: localhost
> User-Agent: curl/8.14.1
> Accept: */*
>
* Request completely sent off
< HTTP/1.1 504 Gateway Time-out
< Server: nginx/1.29.3
< Date: Sun, 07 Dec 2025 23:24:22 GMT
< Content-Type: text/html
< Content-Length: 167
< Connection: keep-alive
<
<html>
<head><title>504 Gateway Time-out</title></head>
<body>
<center><h1>504 Gateway Time-out</h1></center>
<hr><center>nginx/1.29.3</center>
</body>
</html>
* Connection #0 to host localhost left intact
```

Basic exploratory commands:

```bash
admin@i-03fc55a1924a48445:~$ whoami
admin

admin@i-03fc55a1924a48445:~$ id
uid=1000(admin) gid=1000(admin) groups=1000(admin),4(adm),20(dialout),24(cdrom),25(floppy),27(sudo),29(audio),30(dip),44(video),46(plugdev),989(docker)

admin@i-03fc55a1924a48445:~$ pwd
/home/admin

admin@i-03fc55a1924a48445:~$ ls -lah
total 36K
drwx------ 6 admin admin 4.0K Dec  1 16:42 .
drwxr-xr-x 3 root  root  4.0K Sep  7 16:29 ..
drwx------ 3 admin admin 4.0K Sep  7 16:31 .ansible
-rw-r--r-- 1 admin admin  220 Jul 30 19:28 .bash_logout
-rw-r--r-- 1 admin admin 3.5K Jul 30 19:28 .bashrc
-rw-r--r-- 1 admin admin  807 Jul 30 19:28 .profile
drwx------ 2 admin admin 4.0K Sep  7 16:29 .ssh
-rw-r--r-- 1 admin admin    0 Sep  7 16:31 .sudo_as_admin_successful
drwxrwxrwx 2 admin admin 4.0K Dec  1 16:42 agent
drwxrwxrwx 2 admin admin 4.0K Dec  1 16:42 app

admin@i-03fc55a1924a48445:~$ ls -lah app/
total 12K
drwxrwxrwx 2 admin admin 4.0K Dec  1 16:42 .
drwx------ 6 admin admin 4.0K Dec  1 16:42 ..
-rw-rw-r-- 1 admin admin  638 Dec  7 23:46 default.conf

admin@i-03fc55a1924a48445:~$ cat app/default.conf
    server {
        listen 80;
        location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
        }
        location /1 {
            rewrite ^ / break;
            proxy_pass http://statichtml1.sadservers.local;
            proxy_connect_timeout   2s;
            proxy_send_timeout      2s;
            proxy_read_timeout      2s;
        }
        location /2 {
            rewrite ^ / break;
            proxy_pass http://statichtml2.sadservers.local;
            proxy_connect_timeout   2s;
            proxy_send_timeout      2s;
            proxy_read_timeout      2s;
        }
    }
```

We see that we have a nginx config in `app`. It's probably mounted in the nginx container:

```bash
{% raw %}docker ps --format "{{ .ID }} {{ .Names }} {{ json .Networks }} {{ .Mounts }}" --no-trunc{% endraw %}
89bf0e394bb9 statichtml2 "static-net"
1f96c1876662 statichtml1 "static-net"
7440094fc321 nginx "bridge" /home/admin/app/default.conf
```

Docker containers:

```bash
docker ps
CONTAINER ID   IMAGE          COMMAND                  CREATED      STATUS          PORTS                                 NAMES
89bf0e394bb9   statichtml:2   "busybox httpd -f -v…"   6 days ago   Up 20 seconds   3000/tcp                              statichtml2
1f96c1876662   statichtml:1   "busybox httpd -f -v…"   6 days ago   Up 20 seconds   3000/tcp                              statichtml1
7440094fc321   nginx          "/docker-entrypoint.…"   6 days ago   Up 20 seconds   0.0.0.0:80->80/tcp, [::]:80->80/tcp   nginx

docker network ls
NETWORK ID     NAME         DRIVER    SCOPE
9d257323d6f9   bridge       bridge    local
a7250a90f896   host         host      local
b08d312e9d16   none         null      local
cc3e04c023f1   static-net   bridge    local
```

Oh, we have more than one network. Interesting. Let's look into it:

```bash
{% raw %}docker ps --format "{{ .ID }} {{ .Names }} {{ json .Networks }}"{% endraw %}
89bf0e394bb9 statichtml2 "static-net"
1f96c1876662 statichtml1 "static-net"
7440094fc321 nginx "bridge"
```

First issue is here! nginx container is not on the same network than the destination containers. Basic routing issue.

If nginx is a proxy to the other containers, it needs to be on the same network. Otherwise, no traffic will be able to reach the destination containers.

Let's connect the nginx proxy to the `static-net` network:

```bash
docker network connect static-net 7440094fc321
# And confirm it's connected
{% raw %}docker ps --format '{{ .ID }} {{ .Names }} {{ json .Networks }}'{% endraw %}
89bf0e394bb9 statichtml2 "static-net"
1f96c1876662 statichtml1 "static-net"
7440094fc321 nginx "bridge,static-net"
```

At first I thought that was it. But the challenge wasn't done yet. `curl http://localhost/1` was now returning a 502 - Bad Gateway.

We have something else that we need to fix. Let's look at the nginx config. It's on the host at `app/default.conf`. It's been mounted in the nginx container:

```bash
cat app/default.conf
    server {
        listen 80;
        location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
        }
        location /1 {
            rewrite ^ / break;
            proxy_pass http://statichtml1.sadservers.local;
            proxy_connect_timeout   2s;
            proxy_send_timeout      2s;
            proxy_read_timeout      2s;
        }
        location /2 {
            rewrite ^ / break;
            proxy_pass http://statichtml2.sadservers.local;
            proxy_connect_timeout   2s;
            proxy_send_timeout      2s;
            proxy_read_timeout      2s;
        }
    }
```

Did you notice it? The statichtml containers are exposing the port 3000, but this config is using the default HTTP port (80). We have a second issue to fix here!

We need to specify the port 3000 for the proxy redirection to work:

`proxy_pass http://statichtml1.sadservers.local:3000;`

Lastly, for the config change to apply, we restart the container with `docker restart 7440094fc321`.

Did it work?

```bash
curl -v http://localhost/1
[...]
< HTTP/1.1 200 OK
< Server: nginx/1.29.3
< Date: Sun, 07 Dec 2025 23:28:07 GMT
< Content-Type: text/html
< Content-Length: 13
< Connection: keep-alive
< Accept-Ranges: bytes
< Last-Modified: Thu, 30 Oct 2025 20:33:09 GMT
< ETag: "6903cb85-d"
<
HelloWorld;1
* Connection #0 to host localhost left intact
```

It sure did! 🚩
