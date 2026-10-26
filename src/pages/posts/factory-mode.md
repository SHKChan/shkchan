---
layout: '../../layouts/PostLayout.astro'
title: "设计模式：工厂模式（Factory Pattern）在游戏开发中的应用"
date: "2022-09-14"
tags: ["DesignPatterns", "Architecture", "CPP"]
category: "Architecture"
description: "探讨简单工厂、工厂方法与抽象工厂模式在游戏道具与 NPC 实例化中的设计落地。"
---

## 💡 为什么游戏开发需要工厂模式？

在游戏场景中，不同怪物（Monster）、道具（Item）和武器（Weapon）的生成非常频繁。使用工厂模式可以将对象的创建过程与具体业务代码解耦。

### 简单工厂（Simple Factory）

```cpp
class Enemy {
public:
    virtual void Spawn() = 0;
};

class Goblin : public Enemy {
public:
    void Spawn() override { /* 刷出哥布林 */ }
};

class EnemyFactory {
public:
    static std::unique_ptr<Enemy> CreateEnemy(const std::string& type) {
        if (type == "goblin") return std::make_unique<Goblin>();
        return nullptr;
    }
};
```
