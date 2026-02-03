---js
const eleventyNavigation = {
	key: "Home",
	order: 1
};
const title = "Home"
const numberOfLatestPostsToShow = 6;
---

# Hi! Salut!

I'm Jérémie. You've reached my personal website, where I write about stuff I do and learn.

I'm hoping this place can be a [digital garden](https://maggieappleton.com/garden-history). A kind of space where I work and think with the [garage door up](https://notes.andymatuschak.org/zCMhncA1iSE74MKKYQS5PBZ). You might find some content here written in French since this is my native language, but it should mostly be English.

Even though I have a background in cinema and literature, this website is very *geeky* and concerned with technical subjects in the [IT field](https://en.wikipedia.org/wiki/Information_technology).

These past years, I've built a few projects for me and others. You can read about them in [/projects](/projects) if you'd like.

I'm currently working as a Cloud/DevOps Engineer. You can learn more about me in [/about](/about) or read my resume in [/cv](/cv).

📍 Based in Montréal, Qc.

✉️ [email@me](https://letterbird.co/jrb)

---

{% set postsCount = collections.posts | length %}
{% set latestPostsCount = postsCount | min(numberOfLatestPostsToShow) %}
<h2>Blog – Latest {{ latestPostsCount }} post{% if latestPostsCount != 1 %}s{% endif %}</h2>

{% set postslist = collections.posts | head(-1 * numberOfLatestPostsToShow) %}
{% set postslistCounter = postsCount %}
{% include "postslist.njk" %}

{% set morePosts = postsCount - numberOfLatestPostsToShow %}
{% if morePosts > 0 %}
<p>{{ morePosts }} more post{% if morePosts != 1 %}s{% endif %} can be found in <a href="archive.njk">the archive</a>.</p>
{% endif %}
