# Contributing to Calorie Climb

Thank you for your interest in contributing to Calorie Climb! This project aims to make nutrition education fun and accessible for kids through interactive gameplay.

## 🎯 Project Goals

- **Educational**: Teach kids about nutrition and healthy eating habits
- **Safe**: Maintain a kid-friendly environment free from inappropriate content
- **Accurate**: Provide reliable nutritional information using official data sources
- **Fun**: Keep learning engaging through gamification
- **Accessible**: Ensure the app works for users with different abilities and technical setups

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/daveklee/calorieclimb.com.git
   cd calorieclimb.com
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional but recommended)
   ```bash
   cp .env.example .env
   ```
   
   Fill in your API keys:
   - `VITE_USDA_API_KEY`: Get from [USDA Food Data Central](https://fdc.nal.usda.gov/api-guide.html)
   - `VITE_PERPLEXITY_API_KEY`: Get from [Perplexity AI](https://www.perplexity.ai/)
   - `VITE_GA_MEASUREMENT_ID`: Google Analytics 4 measurement ID

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser** to `http://localhost:5173`

## 🛠️ How to Contribute

### Reporting Issues

- **Bug Reports**: Use the GitHub issue tracker to report bugs
- **Feature Requests**: Suggest new features or improvements
- **Content Issues**: Report inappropriate content that slipped through filters

When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots if applicable
- Browser and device information

### Code Contributions

1. **Fork the repository** and create a new branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Test your changes** thoroughly
   - Ensure the app works in both online and offline modes
   - Test with different food inputs
   - Verify kid-friendly content filtering

4. **Commit your changes** with clear, descriptive messages
   ```bash
   git commit -m "Add: new feature description"
   ```

5. **Push to your fork** and create a pull request
   ```bash
   git push origin feature/your-feature-name
   ```

### Coding Standards

- **TypeScript**: Use TypeScript for type safety
- **React Hooks**: Prefer functional components with hooks
- **Tailwind CSS**: Use Tailwind for styling (avoid custom CSS when possible)
- **Accessibility**: Ensure components are accessible (ARIA labels, keyboard navigation)
- **Performance**: Optimize for mobile devices and slower connections
- **Comments**: Add comments for complex logic, especially around nutrition calculations

### File Organization

- `src/components/`: Reusable UI components
- `src/pages/`: Page-level components
- `src/services/`: API integrations (USDA, Perplexity)
- `src/utils/`: Utility functions and helpers
- `src/types/`: TypeScript type definitions

## 🎨 Design Guidelines

- **Kid-Friendly**: Use bright, engaging colors and fun emojis
- **Simple**: Keep interfaces clean and easy to understand
- **Responsive**: Ensure the app works on all device sizes
- **Consistent**: Follow established design patterns throughout the app

## 🔒 Content Safety

This is a kids' app, so content safety is paramount:

- **No Alcohol**: Filter out all alcohol-related content
- **Age-Appropriate**: Ensure all food descriptions are suitable for children
- **Positive Messaging**: Focus on healthy eating education, not diet culture
- **Medical Disclaimers**: Include appropriate disclaimers about medical advice

## 🧪 Testing

- Test both online (with API keys) and offline modes
- Verify food search functionality with various inputs
- Check that inappropriate content is filtered out
- Test responsive design on different screen sizes
- Ensure accessibility features work properly

## 📚 Educational Content

When contributing educational content:

- **Accuracy**: Base information on reliable nutritional sources
- **Age-Appropriate**: Use language suitable for children
- **Positive**: Focus on benefits of healthy foods rather than dangers of unhealthy ones
- **Balanced**: Avoid extreme positions on any foods

## 🤝 Community Guidelines

- **Be Respectful**: Treat all contributors with kindness and respect
- **Be Patient**: Remember that contributors have different skill levels
- **Be Constructive**: Provide helpful feedback and suggestions
- **Be Inclusive**: Welcome contributors from all backgrounds

## 📝 Documentation

Help improve documentation by:
- Updating README files
- Adding code comments
- Creating or updating API documentation
- Writing user guides or tutorials

## 🎉 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Project documentation
- Release notes for significant contributions

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Code Review**: All pull requests receive thorough review and feedback

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for helping make nutrition education fun and accessible for kids! Every contribution, no matter how small, makes a difference. 🍎✨