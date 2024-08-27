import { X } from "lucide-react-native";
import {
  View,
  Text,
  ModalProps,
  ScrollView,
  Modal as RNModal,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";

import { colors } from "@/styles/colors";

type Props = ModalProps & {
  title: string;
  subtitle?: string;
  onClose?: () => void;
};

export function Modal({
  title,
  subtitle = "",
  onClose,
  children,
  ...rest
}: Props) {
  return (
    <RNModal transparent animationType="slide" {...rest}>
      <BlurView
        style={styles.blurView}
        intensity={7}
        tint="dark"
        experimentalBlurMethod="dimezisBlurView"
      >
        <View style={styles.modalContainer}>
          <View style={styles.contentContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>

                {onClose && (
                  <TouchableOpacity activeOpacity={0.7} onPress={onClose}>
                    <X color={colors.blue[400]} size={20} />
                  </TouchableOpacity>
                )}
              </View>

              {subtitle.trim().length > 0 && (
                <Text style={styles.subtitle}>{subtitle}</Text>
              )}

              {children}
            </ScrollView>
          </View>
        </View>
      </BlurView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  blurView: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  contentContainer: {
    backgroundColor: "#18181B",  // zinc-900
    borderTopWidth: 1,
    borderTopColor: "#3F3F46", // zinc-700
    paddingHorizontal: 24, 
    paddingTop: 20, 
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20, 
  },
  title: {
    color: "#FFFFFF", 
    fontWeight: "500", 
    fontSize: 20,
  },
  subtitle: {
    color: "#A1A1AA", // zinc-400
    fontSize: 16, 
    lineHeight: 24, 
    marginTop: 8, 
    marginBottom: 8, 
  },
});
