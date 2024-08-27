import React, { useState } from "react";
import { View, Platform, Text, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Button } from "./button";
import { red } from "react-native-reanimated/lib/typescript/reanimated2/Colors";

type ClockProps = {
    containerStyle?: any; // Alterado para aceitar estilos de objetos
    onTimeChange?: (time: string) => void;
};

export function Clock({ containerStyle, onTimeChange }: ClockProps) {
    const [time, setTime] = useState<Date | null>(null);
    const [show, setShow] = useState(false);

    const onChange = (event: any, selectedDate: Date | undefined) => {
        const currentDate = selectedDate || time || new Date();
        setShow(Platform.OS === "ios");
        setTime(currentDate);

        const formattedTime = `${currentDate
            .getHours()
            .toString()
            .padStart(2, "0")}:${currentDate
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;

        if (onTimeChange) {
            onTimeChange(formattedTime);
        }
    };

    const showTimepicker = () => {
        setShow(true);
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {time && (
                <Text style={styles.timeText}>
                    {time.getHours().toString().padStart(2, "0")}:
                    {time.getMinutes().toString().padStart(2, "0")}
                </Text>
            )}
            <View style={styles.buttonContainer}>
                <Button onPress={showTimepicker} variant="secondary">
                    <Button.Title>
                        {time ? "Alterar Horário" : "Escolher Horário"}
                    </Button.Title>
                </Button>
            </View>

            {show && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={time || new Date()}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={onChange}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16, // p-4
        backgroundColor: "transparent",
        borderRadius: 8, // rounded-lg
        flexDirection: "row", // flex flex-row
        gap: 24, // gap-6
    },
    timeText: {
        color: "white", // text-white
        flex: 1, // flex-1
        textAlign: "center", // text-center
        fontSize: 40, // text-5xl
        height: 48, // h-12
        fontWeight: "bold", // font-bold
        marginTop: -4
    },
    buttonContainer: {
        flex: 1, // flex-1
    },
});
