import React from "react"

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error("Uncaught error:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center space-y-4">
          <h1 className="text-2xl font-bold">Oops! Something went wrong.</h1>
          <p className="text-gray-600 dark:text-gray-400">Please refresh the page.</p>
        </div>
      )
    }

    return this.props.children
  }
}
