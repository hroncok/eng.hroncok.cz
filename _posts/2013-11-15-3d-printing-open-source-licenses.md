---
layout: post
title: "3D printing: Open source licenses"
description: "Do we need a new kind of license for 3D printed objects?"
category: 
tags: [RepRap, Licensing, OpenSCAD]
---
{% include JB/setup %}

**Note:** I'm not a lawyer. This post is mostly just about my thoughts and all of my interpretations of various software or content licenses might be completely wrong. Also, this text asks a lot's of questions and brings no answer. You have been warned.

Models for 3D printing and free software licenses
-------------------------------------------------

I'm a big fan of hobby 3D printing and I'm a big fan of free software and content. When I code, I release my work under the terms of various free software licenses, mostly [ISC](http://en.wikipedia.org/wiki/ISC_license) (similar to MIT) or GNU GPL. When I create stuff for 3D printing, I want to do the same thing: Make it free, as in freedom.

But applying software licenses to content is not a good idea. For that, we have free content licenses, such as favorite Creative Commons ([without NC or ND restrictions](https://fedoraproject.org/wiki/Licensing:Main?rd=Licensing#Bad_Licenses_3)). First of all, most "easy" (a.k.a. short) licenses, such as ISC or MIT, speak about software only. I don't know if I can even legally apply the text about software to something else:

    Permission to use, copy, modify, and/or distribute this software...

On the other hand, GNU GPL thinks about other kind of stuff than software:

    This License applies to any program or other work...

But even though, the license speaks about source and binary form. Even if the source form is well defined as something that's meant for easy editing (or something like that), we are still stuck in the world where we have just two forms: form for editing and form for running/using. I will return to that later and you'll see that in 3D printing, this problem is much more complex.

Creative Commons and other content licenses
-------------------------------------------

So for now on, I could say that Creative Commons is a much better option. An audio track, a photo, even a video or an icon, that's all content. Therefore 3D model has to be content too. However, I code my models. Wait, huh? Yes, I code them, usually in [OpenSCAD](http://openscad.org/). As you might already know, [using Creative Commons for source code is not recommended](http://creativecommons.org/software) (well, that page speaks about software, but you know what I mean). Let's say I release my work under the terms of CC BY-SA. Do others have to distribute the code alongside with the 3D model? And do they need to keep it open source? No, they don't. As long as you are fine with that, there is no trouble. But if you want to keep you work open source, as if you would use GNU GPL, you cannot use Creative Commons. It just doesn't work.

"Source and binary" form of a 3D model
----------------------------------------

To explain the problem, I will return to software. When you code a program, it's usually either compiled or interpreted. Unless it's kind of both. If we stick with the compiled form, it is possible to distribute sources and/or executables (or binary libraries etc.). Various complex licenses define terms for distributing your app in different forms. For example GNU GPL says: if you distribute binary, you have to include the source.

But when I code my 3D models, it has got much more forms. It can exist in a form of source code. The source code can be compiled/rendered to meshes - either binary or ASCII, that'ts not the point here. But even the mesh is easily editable. You can import it into Blender and do crazy stuff with that. Later, the mesh can be compiled/sliced to G-code, that can be compared to binary form or your app for different architectures (while by architectures I mean different 3D printers). While you usually don't distribute just G-code for the technical aspect, it's certainly possible and if you know that other person has the very same printer as you, it's even useful sometimes. But even the G-code can be somehow editable, but not in very delicious way. And last but not least, you have the printed real 3D object.

So let's make it an real world example. I create a model in OpenSCAD. Let's make it simple (and for now ignore the fact that you probably couldn't license a common shape such as cube anyway):

    cube(1);

Then I create a mesh form that code in a form of STL file:

    solid OpenSCAD_Model
      facet normal -1 0 0
        outer loop
          vertex 0 0 1
          vertex 0 1 1
          vertex 0 0 0
        endloop
      endfacet
      facet normal -1 0 0
        outer loop
          vertex 0 0 0
          vertex 0 1 1
          vertex 0 1 0
        endloop
      endfacet
      facet normal 0 0 1
        outer loop
          vertex 0 0 1
          vertex 1 0 1
          vertex 1 1 1
        endloop
      endfacet
      facet normal 0 0 1
        outer loop
          vertex 0 1 1
          vertex 0 0 1
          vertex 1 1 1
        endloop
      endfacet
      facet normal 0 -1 0
        outer loop
          vertex 0 0 0
          vertex 1 0 0
          vertex 1 0 1
        endloop
      endfacet
      facet normal 0 -1 0
        outer loop
          vertex 0 0 1
          vertex 0 0 0
          vertex 1 0 1
        endloop
      endfacet
      facet normal 0 0 -1
        outer loop
          vertex 0 1 0
          vertex 1 1 0
          vertex 0 0 0
        endloop
      endfacet
      facet normal 0 0 -1
        outer loop
          vertex 0 0 0
          vertex 1 1 0
          vertex 1 0 0
        endloop
      endfacet
      facet normal 0 1 0
        outer loop
          vertex 0 1 1
          vertex 1 1 1
          vertex 0 1 0
        endloop
      endfacet
      facet normal 0 1 0
        outer loop
          vertex 0 1 0
          vertex 1 1 1
          vertex 1 1 0
        endloop
      endfacet
      facet normal 1 0 0
        outer loop
          vertex 1 0 0
          vertex 1 1 0
          vertex 1 1 1
        endloop
      endfacet
      facet normal 1 0 0
        outer loop
          vertex 1 0 1
          vertex 1 0 0
          vertex 1 1 1
        endloop
      endfacet
    endsolid OpenSCAD_Model

Then I create a G-code form that:

        G21 ; set units to millimeters
        M107
        M104 S200 ; set temperature
        G28 ; home all axes
        G1 Z5 F5000 ; lift nozzle
        
        M109 S200 ; wait for temperature to be reached
        G90 ; use absolute coordinates
        G92 E0
        M82 ; use absolute distances for extrusion
        G1 F1800.000 E-1.00000
        G92 E0
        G1 Z0.350 F7800.000
        G1 X94.790 Y94.790
        G1 F1800.000 E1.00000
        G1 X95.800 Y93.960 F600.000 E1.04253
        G1 X96.950 Y93.350 E1.08489
        G1 X98.200 Y92.970 E1.12739
        G1 X99.500 Y92.840 E1.16990
        G1 X100.500 Y92.840 E1.20243
        G1 X101.800 Y92.970 E1.24494
        G1 X103.050 Y93.350 E1.28745
        G1 X104.200 Y93.960 E1.32980
        G1 X105.210 Y94.790 E1.37233
        G1 X106.040 Y95.800 E1.41487
        G1 X106.650 Y96.950 E1.45722
        G1 X107.030 Y98.200 E1.49973
        G1 X107.160 Y99.500 E1.54223
        G1 X107.160 Y100.500 E1.57477
        G1 X107.030 Y101.800 E1.61728
        G1 X106.650 Y103.050 E1.65978
        G1 X106.040 Y104.200 E1.70214
        G1 X105.210 Y105.210 E1.74467
        G1 X104.200 Y106.040 E1.78720
        G1 X103.050 Y106.650 E1.82956
        G1 X101.800 Y107.030 E1.87206
        G1 X100.500 Y107.160 E1.91457
        G1 X99.500 Y107.160 E1.94710
        G1 X98.200 Y107.030 E1.98961
        G1 X96.950 Y106.650 E2.03212
        G1 X95.800 Y106.040 E2.07447
        G1 X94.790 Y105.210 E2.11700
        G1 X93.960 Y104.200 E2.15954
        G1 X93.350 Y103.050 E2.20189
        G1 X92.970 Y101.800 E2.24440
        G1 X92.840 Y100.500 E2.28690
        G1 X92.840 Y99.500 E2.31944
        G1 X92.970 Y98.200 E2.36195
        G1 X93.350 Y96.950 E2.40445
        G1 X93.960 Y95.800 E2.44681
        G1 X94.727 Y94.866 E2.48613
        G1 F1800.000 E1.48613
        G92 E0
        G1 X100.000 Y100.000 F7800.000
        G1 F1800.000 E1.00000
        G1 X100.000 Y100.000 F1800.000
        G1 X100.000 Y100.000 F7800.000
        G1 X100.000 Y100.000 F600.000 E1.00000
        G1 X100.000 Y100.000 F7800.000
        G1 X100.000 Y100.000 F1800.000
        M106 S255
        G1 F1800.000 E0.00000
        G92 E0
        G1 Z0.750 F7800.000
        G1 X99.875 Y100.125
        G1 F1800.000 E1.00000
        G1 X100.000 Y100.000 F600.000 E1.00520
        G1 X99.875 Y99.875 E1.01040
        G1 X100.000 Y100.000 F7800.000
        G1 X100.125 Y100.125 F600.000 E1.01559
        G1 X100.000 Y100.000 F7800.000
        G1 X100.125 Y99.875 F600.000 E1.02079
        G1 F1800.000 E0.02079
        G92 E0
        G1 Z1.150 F7800.000
        G1 X99.875 Y100.125
        G1 F1800.000 E1.00000
        G1 X100.000 Y100.000 F600.000 E1.00520
        G1 X99.875 Y99.875 E1.01040
        G1 X100.000 Y100.000 F7800.000
        G1 X100.125 Y100.125 F600.000 E1.01559
        G1 X100.000 Y100.000 F7800.000
        G1 X100.125 Y99.875 F600.000 E1.02079
        G1 F1800.000 E0.02079
        G92 E0
        M107
        M104 S0 ; turn off temperature
        G28 X0  ; home X axis
        M84     ; disable motors

And I print the cube, finally.

Let's say I've released the cube under a software license, such as GPL. Now what is the source and what is not? What if Bob prints it and sells it to Anne, does he need to give her the G-code as well? Or STL file? Or even the OpenSCAD source? Does Bob needs to 2D print GNU GPL's text and distribute it together with the printed cube?

There's more
------------

And that was simple. What if there's a bunch of machine parts for a 3D printer released under GNU GPL and I take just [one part of it](https://github.com/josefprusa/PrusaMendel/blob/master/source/coupling.scad) and I use it in my own printer's design. Is it derivative work and do I need to release my own printer's design as GNU GPL? Does that mean I have to distribute all source code of my printer design together with it? Does that mean STL, G-code or OpenSCAD source? What if I don't use OpenSCAD?

That could be solved by LGPL. Or not. How do I dynamically link a 3D printed object to another one?

I had an idea, that maybe an Open Hardware license could be useful, but that usually speaks just about documentation and therefor is not usable.

How to solve that?
------------------

When I create a 3D model for 3D printing I would like to have a license that satisfy my needs. For most of the cases, that's CC BY-SA for me, as it works like MIT in software. However, I could imagine a situation, where I want to force keep the openness of the code. Of the very first OpenSCAD code. And once I put myself in that situation, I'll be screwed.
