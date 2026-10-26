---
layout: '../../layouts/PostLayout.astro'
title: "Python 风格指南与规范化开发实践"
date: "2022-09-15"
tags: ["Python", "CleanCode"]
category: "Engineering"
description: "PEP 8 规范、类型提示（Type Hints）与优雅的 Pythonic 编写模式。"
---

## 🐍 Pythonic 核心思想

* Explicit is better than implicit.
* Simple is better than complex.

### 推荐实践

1. 始终使用 `dataclasses` 或 `pydantic` 进行数据模型声明。
2. 使用 `black` + `flake8` 进行代码自动格式化与静态检查。
