---
layout: page
title: Miro Hrončok
tagline: My engineering blog
---
{% include JB/setup %}


{% for post in site.posts %}
 * [{{ post.title }}]({{ post.url }}) - {{ post.description }} ({{ post.date | date_to_string }})
{% endfor %}
