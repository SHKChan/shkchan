---
layout: '../../layouts/PostLayout.astro'
title: "MFC 多线程机制与界面渲染解耦总结"
date: "2022-09-14"
tags: ["C++", "MFC", "Multithreading"]
category: "Engineering"
description: "总结 MFC 环境下工作者线程与 UI 线程的通信（PostMessage / SendMessage）与安全退出机制。"
---

## 📌 多线程核心法则

在 Windows/MFC 开发中，**永远不要在非 UI 线程中直接修改 UI 控件状态**。

### 经典解耦模式

1. 使用 `AfxBeginThread` 创建工作者线程进行计算/数据加载。
2. 数据准备就绪后，通过 `PostMessage(WM_USER_UPDATE_UI, wParam, lParam)` 通知主线程更新。
