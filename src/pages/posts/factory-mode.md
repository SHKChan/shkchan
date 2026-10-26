---
layout: '../../layouts/PostLayout.astro'
title: "Design Patterns: Factory Pattern in Game Architecture"
date: "2022-09-14"
tags: ["DesignPatterns", "Architecture", "CPP"]
category: "Architecture"
description: "Applying Simple Factory, Factory Method, and Abstract Factory patterns for item spawning and NPC instantiation."
---

## 💡 Why Game Development Needs Factory Patterns

In game scenes, creating monsters, items, and projectiles happens constantly. Factory patterns decouple object instantiation from game loop logic.

### Simple Factory Example

```cpp
class Enemy {
public:
    virtual void Spawn() = 0;
};

class Goblin : public Enemy {
public:
    void Spawn() override { /* Spawn Goblin */ }
};

class EnemyFactory {
public:
    static std::unique_ptr<Enemy> CreateEnemy(const std::string& type) {
        if (type == "goblin") return std::make_unique<Goblin>();
        return nullptr;
    }
};
```
