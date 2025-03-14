# Folder Validator 📁

[![npm version](https://badge.fury.io/js/folder-validator.svg)](https://www.npmjs.com/package/folder-validator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/folder-validator)](https://nodejs.org/)

The **Folder Validator** package is a powerful tool designed to ensure consistency in your application's folder structure across different developers. With this package, you can maintain a uniform folder layout, preventing any structural changes that might lead to application breaks.

> "I've created this package because I was tired of having to check the folder structure of my application every time another developer was working on it. I wanted to make sure that the folder structure of my application was consistent and that it was not changed by another developer preventing breaks in the application, so I created this package." - **Daniel Rosa**

## 🌟 Key Features

- **Structure Validation**: Automatically validates your project's folder structure against a predefined configuration
- **Real-time Monitoring**: Watch mode for continuous folder structure validation during development
- **Flexible Configuration**: Simple and intuitive configuration file to define your desired folder structure
- **Required vs Optional**: Specify which folders are mandatory and which are optional
- **Nested Structures**: Support for deep nested folder hierarchies
- **Developer Friendly**: Clear error messages and validation feedback
- **Zero Runtime Dependencies**: Lightweight and fast execution

## 🚀 Why Folder Validator?

- **Maintain Consistency**: Ensure all team members follow the same project structure
- **Prevent Breaking Changes**: Catch structural inconsistencies before they cause issues
- **Improve Onboarding**: New developers can quickly understand and maintain the correct project structure
- **CI/CD Integration**: Easy to integrate into your continuous integration pipeline
- **Framework Agnostic**: Works with any JavaScript/TypeScript project structure

## 📦 Installation

```bash
npm install folder-validator -D
```

## 🛠️ Usage

1. Create a `folder.config.js` file in your project root:

```javascript
export default [
  {
    name: "src",
    required: true,
    children: [
      {
        name: "components",
        required: true,
      },
      {
        name: "pages",
        required: true,
      },
    ],
  },
  {
    name: "public",
    required: true,
  },
  {
    name: "styles",
    required: false,
  },
];
```

2. Add validation scripts to your `package.json`:

```json
{
  "scripts": {
    "validate:folders": "folder-validator",
    "validate:watch": "folder-validator --watch"
  }
}
```

3. Run the validator:

```bash
# One-time validation
npm run validate:folders

# Watch mode for development
npm run validate:watch
```

## 📖 Configuration Options

### Folder Definition

| Property | Type    | Description                          |
| -------- | ------- | ------------------------------------ |
| name     | string  | Name of the folder                   |
| required | boolean | Whether the folder must exist        |
| children | array   | Nested folder definitions (optional) |

## 🔍 Examples

### Basic Structure

```javascript
export default [
  {
    name: "src",
    required: true,
  },
];
```

### Complex Structure

```javascript
export default [
  {
    name: "src",
    required: true,
    children: [
      {
        name: "components",
        required: true,
        children: [
          {
            name: "common",
            required: true,
          },
          {
            name: "layouts",
            required: false,
          },
        ],
      },
    ],
  },
];
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Daniel Rosa**
