---
layout: '../../layouts/PostLayout.astro'
title: "RPA 自动化流程设计与异常重试机制思考"
date: "2026-06-04"
tags: ["Automation", "RPA", "Architecture"]
category: "Engineering"
description: "在自动化流程（Robotic Process Automation）中如何建立高稳健度的容错与断点续跑体系。"
---

## ⚙️ 稳健性设计原则

1. **元素定位容错**：优先使用 Selector/XPath 语义定位，辅以图像匹配。
2. **幂等性设计**：保证流程因意外中断重启后不会重复扣款或生成重复订单。
