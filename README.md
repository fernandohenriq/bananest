# 🐱🍌 BanaNest

A lightweight dependency injection framework inspired by NestJS for learning purposes!

<!--
<p align="center">
  <img src="assets/bananest-logo.png" width="200" alt="Bananest Logo">
</p> -->

## 🎯 Purpose

This project is a study implementation that recreates core functionalities found in NestJS, focusing on:

- Understanding how dependency injection works under the hood
- Implementing decorators for routing and DI container
- Creating a modular architecture system
- Building HTTP abstractions similar to NestJS controllers

## 🏗️ Core Concepts Implemented

### Dependency Injection

- Custom DI container implementation
- Constructor injection using decorators
- Singleton and transient lifetime management
- Circular dependency detection

### Decorators

- `@Inject(token or class)` for dependency injection
- `@Controller(prefix)` for routing
- `@Get(path)`, `@Post(path)`, `@Put(path)`, `@Delete(path)`, `@Patch(path)` for HTTP methods

### Modular Architecture

- Module system for organizing code
- Feature modules with their own providers
- Shared modules and services

## 🚀 Getting Started

```bash
# With npm
`npm install bananest`

# With yarn
`yarn add bananest`
```

## 🔧 Technical Stack

- TypeScript
- Node.js
- Vitest for testing
- Express.js (as underlying HTTP server)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by NestJS framework
- Built for educational purposes to understand DI and decorators
- Special thanks to Bananinha the cat for the name inspiration! 🐱
