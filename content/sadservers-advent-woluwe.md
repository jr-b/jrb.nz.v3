+++
aliases = ["posts/sadservers-advent-woluwe/"]
title = "Woluwe - Advent of Sysadmin 2025 - 12/04"
date = 2025-12-04
[taxonomies]
tags = ["devops", "ctf"]
+++

> This is part of Sad Servers' [Advent of Sysadmin 2025](https://sadservers.com/advent) series.
>
> I'm doing each challenge every day and I'm publishing a quick write up for each one every day.
>
> 12-04: Docker image history
>
> Spoiler alert! This gives the solution to the challenge.
> If you want to do it on your own, stop reading.

---

**Scenario:** "Woluwe": Too many images

**Level:** Medium

**Description:** A pipeline created a lot of Docker images locally for a web app. All these images except for one contain a typo introduced by a developer: there's an incorrect image instruction to pipe "HelloWorld" to "index.htmlz" instead of using the correct "index.html"  
Find which image doesn't have the typo (and uses the correct "index.html"), tag this correct image as "prod" and then deploy it with docker run -d --name prod -p 3000:3000 prod so it responds correctly to HTTP requests on port :3000 instead of "404 Not Found".

**Test:** curl http://localhost:3000 should respond with HelloWorld;529

The "Check My Solution" button runs the script */home/admin/agent/check.sh*, which you can see and execute.

**Time to Solve:** 15 minutes.

**OS:** Debian 13

**Root (sudo) Access:** Yes

---

There's a total of 102 images that have been built on this server.

We need to inspect/grep the content of the build layers to find the correct image ID that has the index.html file.

We can use `docker history` to look at the build steps of an image:

```bash
{% raw %}admin@i-0bb15e2e2e010d1f8:~$ docker history 3233cb6d5327
IMAGE          CREATED       CREATED BY                                      SIZE      COMMENT
3233cb6d5327   9 days ago    RUN |1 HW=529 /bin/sh -c head -c 1m /dev/ura…   1.05MB    buildkit.dockerfile.v0
<missing>      9 days ago    RUN |1 HW=529 /bin/sh -c echo "HelloWorld;$H…   15B       buildkit.dockerfile.v0
<missing>      9 days ago    ARG HW=529                                      0B        buildkit.dockerfile.v0
<missing>      5 weeks ago   CMD ["busybox" "httpd" "-f" "-v" "-p" "3000"]   0B        buildkit.dockerfile.v0
<missing>      5 weeks ago   WORKDIR /home/static                            0B        buildkit.dockerfile.v0
<missing>      5 weeks ago   USER static                                     0B        buildkit.dockerfile.v0
<missing>      5 weeks ago   RUN /bin/sh -c adduser -D static # buildkit     1.66kB    buildkit.dockerfile.v0
<missing>      5 weeks ago   EXPOSE &{[{{3 0} {3 0}}] 0xc000579b40}          0B        buildkit.dockerfile.v0
<missing>      3 years ago   BusyBox 1.35.0 (glibc), Debian 12               4.27MB{% endraw %}
```

But we need the `--no-trunc` flag to get the full layer command that was used.

Let's look at an example with the typo to see what we're looking for:

```bash
admin@i-0bb15e2e2e010d1f8:~$ docker history --no-trunc 3233cb6d5327 | grep -E "index\.html"
<missing>      9 days ago    RUN |1 HW=529 /bin/sh -c echo "HelloWorld;$HW" > index.htmlz # buildkit     15B       buildkit.dockerfile.v0
```

See the typo? `index.htmlz` instead of `index.html`.

So it's simple enough:

- Loop over the docker images
- For each one, print the docker history
- Grep exclusively for the index.html file (`-w` flag)
- Print the id of the winning image

```bash
admin@i-0bb15e2e2e010d1f8:~$ for i in $(docker image ls -q); do docker history --no-trunc $i | grep -w "index.html" && echo "Found image id $i"; done
<missing>                                                                 9 days ago    RUN |1 HW=529 /bin/sh -c echo "HelloWorld;$HW" > index.html # buildkit     15B       buildkit.dockerfile.v0

Found image id 3f8befa65f01

```

Then tag and run the image:

```bash
admin@i-0bb15e2e2e010d1f8:~$ docker tag 3f8befa65f01 prod

admin@i-0bb15e2e2e010d1f8:~$ docker run -d --name prod -p 3000:3000 prod
f52854c96451c2d3131202bfe4ca0a7b8ac9b20dea528f7642edb26e216ee17c
```

How simple is that! This one felt way easier... 🚩
