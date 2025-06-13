import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <View style={styles.container}>
      <View style={styles.errorCard}>
        <Text style={styles.title}>Oops! Something went wrong</Text>
        <Text style={styles.message}>
          We encountered an unexpected error. Please try refreshing the app.
        </Text>
        
        {__DEV__ && error && (
          <View style={styles.debugInfo}>
            <Text style={styles.debugTitle}>Debug Information:</Text>
            <Text style={styles.debugText}>{error.message}</Text>
          </View>
        )}
        
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
          onPress={resetErrorBoundary}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </Pressable>
      </View>
    </View>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
    
    // Log to error reporting service in production
    if (!__DEV__ && this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetErrorBoundary = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    // Call optional reset callback
    if (this.props.onReset) {
      this.props.onReset();
    }
    
    console.log('Error boundary reset');
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI
      return (
        <ErrorFallback 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.containerPadding,
  },
  
  errorCard: {
    backgroundColor: colors.secondary,
    borderRadius: spacing.borderRadius.large,
    padding: spacing.xl,
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  title: {
    fontSize: typography.fontSize.xlarge,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontFamily: typography.fontFamily.primary,
  },
  
  message: {
    fontSize: typography.fontSize.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed,
    marginBottom: spacing.lg,
    fontFamily: typography.fontFamily.system,
  },
  
  debugInfo: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.lg,
    width: '100%',
  },
  
  debugTitle: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
    color: colors.warning,
    marginBottom: spacing.sm,
    fontFamily: typography.fontFamily.system,
  },
  
  debugText: {
    fontSize: typography.fontSize.small,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    lineHeight: typography.lineHeight.normal,
  },
  
  button: {
    backgroundColor: colors.button,
    borderRadius: spacing.borderRadius.medium,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minWidth: 120,
  },
  
  buttonPressed: {
    backgroundColor: colors.buttonPressed,
  },
  
  buttonText: {
    color: colors.text,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    fontFamily: typography.fontFamily.primary,
  },
});

export default ErrorBoundary;
