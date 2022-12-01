---
layout: post
title: "IPython-like RPM Lua interactive console"
description: "An interactive RPM Lua console that resembles IPython"
category: 
tags: [RPM, Lua, Python, Fedora]
---
{% include JB/setup %}

Recently, I've found myself in a position of writing and debugging some Lua based RPM macros and generators:

- [speeding up python(abi) dependency generator by rewriting it from Bash to parametric Lua macro](https://github.com/rpm-software-management/rpm/pull/1153)
- [adding automated provides to replace most of the manual %python_provide calls](https://src.fedoraproject.org/rpms/python-rpm-generators/pull-request/7)
- [reimplementing %python_provide from scratch as %py_provides](https://src.fedoraproject.org/rpms/python-rpm-macros/pull-request/52)

The capabilities of the [embedded Lua interpreter in RPM](https://rpm.org/user_doc/lua.html) are endless. My Lua skills are not. I need to test the code in small chunks to understand what am I doing.

![meme](https://i.kym-cdn.com/entries/icons/original/000/008/342/ihave.jpg)

When I need to do this in Python, I use the [IPython](https://ipython.org/) console (my second favorite software in the Python ecosystem after [pytest](https://docs.pytest.org/)).

![IPython console](/assets/2020-05-14-ilua-rpm-console/ipython.png)

For Lua, I've used the `lua` command for a while. It lets me test basic Lua concepts in an interactive console, but it's not that powerful as the IPython console and it lacks the RPM provided Lua libraries.

![Basic Lua console](/assets/2020-05-14-ilua-rpm-console/lua.png)

I've asked Panu (my colleague and an RPM developer I work with when submitting changes to the RPM project) whether there is an interactive console for the Lua interpreter embedded in RPM [and the answer was yes](https://github.com/rpm-software-management/rpm/pull/1153#discussion_r401514078). I can use `rpm --eval "%{lua:rpm.interactive()}"`. But it has some quirks.

![Basic RPM Lua interactive shell](/assets/2020-05-14-ilua-rpm-console/rpm-interactive.png)

Mostly, there is no command history or even line editing, and [the output is hard to get](https://github.com/rpm-software-management/rpm/issues/1215).

## ILua

Naturally, I've searched for an IPython like Lua console and I've found the [list of Jupyter Kerneles](https://github.com/jupyter/jupyter/wiki/Jupyter-kernels) (IPython console is a frontend to [Jupyter](https://jupyter.org/)). There are 3 Lua kernels there:

- [Lua Kernel](https://github.com/neomantra/lua_ipython_kernel) (discontinued)
- [IPyLua](https://github.com/pakozm/IPyLua) (a fork of the above, not much active either)
- [ILua](https://github.com/guysv/ilua)

ILua intrigued me mostly because it says right away: *"Lua-implementation agnostic, should work with any Lua interpreter out of the box."* That's exactly what I need. Maybe I can use it with `rpm --eval "%{lua:rpm.interactive()}"`.

Turns out I can, [but it's not that simple](https://github.com/guysv/ilua/issues/10). The used Lua interpreter needs to respect the `$LUA_PATH` environment variable and execute the file given to it as a command-line argument. Naturally, the simplistic `rpm --eval "%{lua:rpm.interactive()}"` does neither.

So I've created a wrapper:

```bash
#!/usr/bin/bash
exec rpm --eval '%{lua:package.path = "'${LUA_PATH}';" .. package.path;'"$(cat "$@")"';rpm.interactive()}'
```

And it mostly worked. Except for the [slight problem with missing print output](https://github.com/rpm-software-management/rpm/issues/1215). (The executed ILua script does the interactivity, so I've removed the `rpm.interactive()` call at the end.)

![ILua using a Bash wrapper over RPM Lua](/assets/2020-05-14-ilua-rpm-console/bash-wrapper.png)

I've tried to figure out how to launch the RPM Lua interpreter, not in the RPM macro expansion mode (that thing eats all the print output until the end). I've done a little RPM symbols lookup and source reading and figured out there is an `rpmluaRunScript()` function in `librpmio`. So I've tried to use it:

```python
#!/usr/bin/python3
from ctypes import cdll, c_char_p

librpmio = cdll.LoadLibrary("librpmio.so.9")
librpmio.rpmluaRunScript(None, c_char_p(b"rpm.interactive()"), None)
```

It works. A little tweaking to support ILua as well as other use cases:

{% gist 63c36381e2daa12446cb70c1a30bef2e %}

Note by Panu: *`rpmluaRunScript()` and `rpmluaRunScriptFile()` are not considered public API and are not available in the public headers on C side, although the symbols are accessible in the ABI. So they are subject to change without further notice, although the likelihood of that happening doesn't seem that great, they've been exactly the way are since their inception 16 years ago.*

And now I have an interactive IPython-like shell for RPM embedded Lua with command history, line editing, completion and more:

![ILua using a Python ctypes wrapper over RPM Lua](/assets/2020-05-14-ilua-rpm-console/irpmlua.png)

Enjoy! PS: ILua is on [package review for Fedora](https://bugzilla.redhat.com/show_bug.cgi?id=1834280), but can be safely pip-installed in the meantime.

---

## Update from 2022

On RPM 4.18, the script above does not work, but you can use this instead:

```sh
#!/usr/bin/sh -eu
/usr/bin/rpmlua -e 'package.path =  os.getenv("LUA_PATH") .. ";" .. package.path' "$@"
```
