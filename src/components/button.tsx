import React, { createContext, useContext } from "react";
import {
  Text,
  TextProps,
  TouchableOpacity,
  ActivityIndicator,
  TouchableOpacityProps,
  StyleSheet,
} from "react-native";

type Variants = "primary" | "secondary";

type ButtonProps = TouchableOpacityProps & {
  variant?: Variants;
  isLoading?: boolean;
};

const ThemeContext = createContext<{ variant?: Variants }>({});

const styles = StyleSheet.create({
  buttonBase: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    borderRadius: 8,
    paddingHorizontal: 8,
    gap: 4,
    flex: 0, 
    flexShrink: 0, 
  },
  primaryButton: {
    backgroundColor: "#0ea5e9", // bg-sky-500
  },
  secondaryButton: {
    backgroundColor: "#d4d4d4", // bg-neutral-300
  },
  primaryText: {
    color: "#e0f2fe", // text-sky-100
  },
  secondaryText: {
    color: "#404040", // text-neutral-700
  },
});

function Button({
  variant = "primary",
  children,
  isLoading,
  style,
  ...rest
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.buttonBase,
        variant === "primary" ? styles.primaryButton : styles.secondaryButton,
        style,
      ]}
      activeOpacity={0.7}
      disabled={isLoading}
      {...rest}
    >
      <ThemeContext.Provider value={{ variant }}>
        {isLoading ? <ActivityIndicator color={variant === "primary" ? "#1B5E20" : "#EDEDED"} /> : children}
      </ThemeContext.Provider>
    </TouchableOpacity>
  );
}

function Title({ children, style }: TextProps) {
  const { variant } = useContext(ThemeContext);

  return (
    <Text
      style={[
        { fontSize: 16, fontWeight: "600" },
        variant === "primary" ? styles.primaryText : styles.secondaryText,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

Button.Title = Title;

export { Button };
