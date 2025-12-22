+++
title = "Kortenberg - Advent of Sysadmin 2025 - 12/03"
date = 2025-12-03
[taxonomies]
tags = ["devops", "ctf"]
+++

> This is part of Sad Servers' [Advent of Sysadmin 2025](https://sadservers.com/advent) series.
>
> I'm doing each challenge every day and I'm publishing a quick write up for each one every day.
>
> 12-03: File permissions issue
>
> Spoiler alert! This gives the solution to the challenge.
> If you want to do it on your own, stop reading.

---

**Scenario:** "Kortenberg": Can't touch this!

**Level:** Easy

**Type:** Fix

**Tags:**

**Access:** Email

**Description:** Is "All I want for Christmas is you" already everywhere?. A bit unrelated, someone messed up the permissions in this server, the *admin* user can't list new directories and can't write into new files. Fix the issue.
**NOTE:** Besides solving the problem in your current admin shell session, you need to fix it permanently, as in a new login shell for user "admin" (like the one initiated by the scenario checker) should have the problem fixed as well.

**Root (sudo) Access:** True

**Test:** The *admin* user in a separate Bash login session should be able to create a new directory in your /home/admin directory, as well as being able to create a file into this new directory and add text into the new file.

The "Check My Solution" button runs the script */home/admin/agent/check.sh*, which you can see and execute.

**Time to Solve:** 15 minutes.

---

Just like I started the last one, let's see what we know just by reading the instructions:

- Permissions are messed up
- The admin user can't list/create new files/directories

Ok. Let's poke around. Creating files and folders, we get the wrong permissions:

```bash
admin@i-038be5ca7a3896dec:~$ mkdir testdir
admin@i-038be5ca7a3896dec:~$ touch testfile
admin@i-038be5ca7a3896dec:~$ ls -lah
total 40K
drwx------ 6 admin admin 4.0K Dec  4 14:42 .
drwxr-xr-x 3 root  root  4.0K Sep  7 16:29 ..
[...]
d--------- 2 admin admin 4.0K Dec  4 14:42 testdir
---------- 1 admin admin    0 Dec  4 14:42 testfile
```

This is an issue with `umask`!

> [umask(2) - Linux manual page](https://man7.org/linux/man-pages/man2/umask.2.html)

We can see the umask of the running process, which is our bash session:

```bash
admin@i-038be5ca7a3896dec:~$ ps
    PID TTY          TIME CMD
   1120 pts/0    00:00:00 bash
   1145 pts/0    00:00:00 ps
admin@i-038be5ca7a3896dec:~$ echo $$ # Get PID of current process
1120
admin@i-038be5ca7a3896dec:~$ grep '^Umask:' /proc/$$/status
Umask:  0777
```

But where is that set?

The /etc/profile file sets the umask to 777, which is no permission at all:

```bash
admin@i-038be5ca7a3896dec:~$ tail /etc/profile

if [ -d /etc/profile.d ]; then
  for i in $(run-parts --list --regex '^[a-zA-Z0-9_][a-zA-Z0-9._-]*\.sh$' /etc/profile.d); do
    if [ -r $i ]; then
      . $i
    fi
  done
  unset i
fi
umask 777
```

We need to fix that umask value, at least for the admin user. We could simply call `umask <mask>`, but that would only work for our current session and not, like it's explained in the instructions, in a new shell/login for the admin user.

What we can do is change the umask in a file loaded during a login session, like `~/.profile`.

But what umask value do we need? The usual default is 022, which gives 644 for files and 755 for directories, according to this [umask table](https://gist.github.com/magnetikonline/2edccbafecbea9726488c05afa866664)

```bash
echo "umask 022" >> ~/.profile
```

And voilà! 🚩 A new interactive login shell will load the admin's profile file and get the right permissions.
