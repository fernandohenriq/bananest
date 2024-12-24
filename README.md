# 🐱🍌 BanaNest

BanaNest is a lightweight dependency injection framework inspired by NestJS started as an educational project to understand modern framework architectures, but aims to evolve into a lightweight alternative for applications that need:

- A simplified dependency injection system
- Clean architectural patterns
- Type-safe decorators
- Modular structure without the overhead of larger frameworks

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

- Dependency injection: `@Inject(token or class)`
- Routing: `@Controller(prefix)`
- HTTP methods: `@Get(path)`, `@Post(path)`, `@Put(path)`, `@Delete(path)`, `@Patch(path)`

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

## 🤝 Contributing

While BanaNest started as a learning project, we welcome contributions! Whether you're fixing bugs, adding features, or improving documentation.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by NestJS architecture and patterns
- Built with both learning and practical usage in mind
- Named after Bananinha the cat! 🐱
