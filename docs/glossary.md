---
title: Glossary
sidebar_position: 98
---

# Glossary

### Feed

A _feed_ is usually synonymous with "an analysis." Think of feeds as to how you
would organize separate analysis projects. Most of what you do in _ChRIS_
centers around feeds: to process data, you upload inputs, create a feed, and in
the feed you [run plugins](#plugin-instance).

Technically, a _feed_ is a [directed acyclic graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph)
of [plugin instances](#plugin-instance).

### Plugin

A Linux command-line program that can run within _ChRIS_ to process data.
These are usually scientific or medical software. See [plugins](./plugins).

### Plugin Instance

A.K.A. job, plugin

The phrase "to run a plugin" is synonymous with "to create a plugin instance."
A plugin instance has a status which can be created, waiting, running, finishedSuccessfully, or finishedWithError. If finished, a plugin instance
has an output folder.

### Superuser

Superusers are admin user accounts. They can log in at `http(s)://<your.chris.host>/chris-admin/`
to perform administrative tasks such as

- Add/delete plugins
- Add/change/delete users

