import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { DateData } from "react-native-calendars";
import { List } from "lucide-react-native";
import dayjs from "dayjs";

import { Button } from "@/components/button";
import { Calendar } from "@/components/calendar";
import { Clock } from "@/components/clock";
import { Modal } from "@/components/modal";
import { colors } from "@/styles/colors";
import { DatesSelected, calendarUtils } from "@/utils/calendarUtils";

interface HomeProps {
    nomeRemedio: string;
    horario: string;
    data: string;
}

enum MODAL {
    NONE = 0,
    CALENDAR = 1,
    CLOCK = 2,
}

export function Home({ nomeRemedio, horario, data }: HomeProps) {
    // DATA
    const [selectedDate, setSelectedDate] = useState({} as DatesSelected);

    // MODAL
    const [showModal, setShowModal] = useState(MODAL.NONE);

    function handleSelectDate(selectedDay: DateData) {
        const dates = calendarUtils.orderStartsAtAndEndsAt({
            startsAt: selectedDate.startsAt,
            endsAt: selectedDate.startsAt,
            selectedDay,
        });

        setSelectedDate(dates);
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View>
                    <Text style={styles.title}>
                        O próximo remédio é:
                    </Text>
                    <Text style={styles.medicineName}>
                        {nomeRemedio}
                    </Text>
                    <Text style={styles.infoText}>
                        às
                        <Text style={styles.highlightText}>
                            {" "}
                            {horario}{" "}
                        </Text>
                        do dia
                        <Text style={styles.highlightText}>
                            {" "}
                            {data}
                        </Text>
                    </Text>
                </View>

                {/* Detalhes de Uso */}
                <Text style={styles.usageDetails}>
                    Lembre-se de tomar seu medicamento com um copo de água e
                    seguir as instruções do seu médico.
                </Text>

                {/* Botão para abrir o modal da lista dos remédios */}
                <View style={styles.buttonContainer}>
                    <Button
                        onPress={() =>
                            Alert.alert(
                                "Medicamentos!",
                                "Nenhum medicamento cadastrado."
                            )
                        }
                    >
                        <List size={24} color={colors.sky[100]} />
                        <Button.Title>Ver Lista de Remédios</Button.Title>
                    </Button>
                </View>
            </View>

            <Modal
                title="Qual dia?"
                subtitle="Selecione a data para o remédio do repartimento especificado"
                visible={showModal == MODAL.CALENDAR}
                onClose={() => setShowModal(MODAL.NONE)}
            >
                <View style={styles.modalContent}>
                    <Calendar
                        minDate={dayjs().toISOString()}
                        onDayPress={handleSelectDate}
                        markedDates={selectedDate.dates}
                    />

                    <Button onPress={() => setShowModal(MODAL.NONE)}>
                        <Button.Title>Confirmar</Button.Title>
                    </Button>
                </View>
            </Modal>

            <Modal
                title="Que horas?"
                subtitle="Selecione o horário para o remédio do repartimento especificado"
                visible={showModal == MODAL.CLOCK}
                onClose={() => setShowModal(MODAL.NONE)}
            >
                <View style={styles.modalContent}>
                    <Clock />

                    <Button onPress={() => setShowModal(MODAL.NONE)}>
                        <Button.Title>Confirmar</Button.Title>
                    </Button>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingBottom: 128,
    },
    content: {
        gap: 40,
        alignItems: "center",
    },
    title: {
        color: "#1C1C1E", // text-zinc-900
        fontSize: 32, // text-4xl
        fontWeight: "bold",
        textAlign: "center",
    },
    medicineName: {
        color: "#3B82F6", // text-blue-500
        fontSize: 48, // text-6xl
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 8,
    },
    infoText: {
        color: "#1C1C1E", // text-zinc-900
        fontSize: 24, // text-3xl
        textAlign: "center",
    },
    highlightText: {
        color: "#60A5FA", // text-blue-400
        fontSize: 24, // text-3xl
        fontWeight: "bold",
        textAlign: "center",
    },
    usageDetails: {
        color: "#525252", // text-neutral-600
        fontSize: 18, // text-lg
        textAlign: "center",
        marginTop: 8,
    },
    buttonContainer: {
        width: 256, // w-64
    },
    modalContent: {
        gap: 16, // gap-4
        marginTop: 16, // mt-4
    },
});
