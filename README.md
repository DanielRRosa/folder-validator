# Folder Validator

The **Folder Validator** package is a powerful tool designed to ensure consistency in your application's folder structure across different developers. With this package, you can maintain a uniform folder layout, preventing any structural changes that might lead to application breaks.

> "I've created this package because I was tired of having to check the folder structure of my application every time another developer was working on it. I wanted to make sure that the folder structure of my application was consistent and that it was not changed by another developer preventing breaks in the application, so I created this package." - **Daniel Rosa**

## Installation

To install the package, run the following command:

```bash
npm install folder-validator
```

## Usage

Here's a simple example of how to use the package:

```javascript
module.exports = [
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
    alias: ["css"],
    required: false,
  },
];
```
