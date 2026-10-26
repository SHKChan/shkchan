---
layout: '../../layouts/PostLayout.astro'
title: "MFC Multi-threading & UI Thread Decoupling"
date: "2022-09-14"
tags: ["C++", "MFC", "Multithreading", "GUI"]
category: "Engineering"
description: "Safe UI thread communication using PostMessage / SendMessage and worker thread management in Windows C++ GUI apps."
---

## Golden Rule of GUI Threading

In Windows GUI development, **never update UI components directly from background worker threads**.

### Decoupled Workflow Pattern

1. Spin up worker threads using `AfxBeginThread` for heavy computations.
2. Dispatch UI update requests back to the main thread via `PostMessage(WM_USER_UPDATE_UI, wParam, lParam)`.
