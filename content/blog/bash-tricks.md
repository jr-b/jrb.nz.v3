+++
aliases = ["posts/bash-tricks/"]
title = "Bash with no letters"
date = 2024-10-10
updated = 2025-10-10
[taxonomies]
tags = ["bash"]
[extra]
+++

I recently did a challenge on PicoCTF (`U2Fuc0FscGhhCg` 🐶) and I had to explore some bash trickery to solve it. I learned a few that are worth noting here for future me or future you.

The challenge starts in a limited shell in which you can only enter numbers and _some_ special characters.

```bash
$ ls
Unknown character detected
$ \l\s
Unknown character detected
$ \\l\\s
Unknown character detected
```

Excluded characters were: `a-zA-Z\`

Got to find a way to enter letters without using letters! Or so I thought.

## Substring expansion

My first idea was to capture any error message into a variable and to use that to get the letters I needed.

Once I got `l` and `s`, I could capture the output of `ls` and then `cat` the flag file.

```bash
$ /_
bash: /_: No such file or directory

# capture the error message with redirection of stderr into stdout
_1=$( /_ 2>&1 )
# excellent! we now have access to an l and an s
# index 0 is `b`, index 1 is `a`, and so on

# ls
${_1:20:1}${_1:2:1}
folder    on-celestran.txt

# capture output of ls to reference the folder name
_3=$(${_1:20:1}${_1:2:1} 2>&1)

# ls folder
${_1:20:1}${_1:2:1} ${_3:0:6}
flag.txt  on-elphe-9.txt

# capture output of ls folder
_4=$(${_1:20:1}${_1:2:1} ${_3:0:6} 2>&1)

# cat folder/flag.txt
${_1:30:1}${_1:1:1}${_1:31:1} ${_3:0:6}/${_4:0:8}
return 0 [redacted-flag]
```

That's very ugly to say the least. But I got the flag anyway! 🚩

That was the long way, though. Turns out there was a very simple way to get the flag. Not sure why I didn't think of it earlier!

## Path expansion, wildcards & pattern matching

> [Pattern matching in the bash manual](https://www.gnu.org/software/bash/manual/html_node/Pattern-Matching.html)

Using only `*` and `?`, we can list files in directories or call some binaries.

```bash
$ /***/****[64]
/bin/base64: extra operand ‘/bin/col6’
Try '/bin/base64 --help' for more information.
```

To make this work, we would need something more specific since we're matching more than one binary. But it could work.

An even easier way is to use only path exapansion and wildcards.

I noticed `~` was working as expected:

```bash
$ ~/
bash: /home/ctf-player/: Is a directory

$ ~/*
bash: /home/ctf-player/folder: Is a directory

$ ~/??????/*
bash: /home/ctf-player/folder/flag.txt: Permission denied
```

Now we know where the flag is located!

## Subshell

> The command substitution `$(cat file)` can be replaced by the equivalent but faster `$(< file)`. [Source](https://flokoe.github.io/bash-hackers-wiki/syntax/expansion/cmdsubst/?h=subs#specialities)

Turns out we don't even need letters!

Reading the flag is as simple as sending the path pattern as an input redirect in the subshell. Since there's the `return 0` string at the beginning of the flag file, we need to quote the command substitution to get the whole string.

```bash
$ "$(<~/*/????.???)"
bash: return 0 [redacted-flag]: command not found
```

There you have it, folks, that's bash in all its beauty! 😅
