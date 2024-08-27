import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TextInput, StyleSheet, Alert } from "react-native";
import { Pencil, Trash } from "lucide-react-native";
import { DateData } from "react-native-calendars";
import dayjs from "dayjs";
import firestore from "@react-native-firebase/firestore";

import { Button } from "@/components/button";
import { Calendar } from "@/components/calendar";
import { Clock } from "@/components/clock";
import { Modal } from "@/components/modal";
import { colors } from "@/styles/colors";
import { DatesSelected, calendarUtils } from "@/utils/calendarUtils";
import { Loading } from "@/components/loading";

interface Compartment {
    id: number;
    medicineName: string;
    date: string;
    time: string;
}

const initialCompartments: Compartment[] = Array.from(
    { length: 14 },
    (_, i) => ({
        id: i + 1,
        medicineName: "",
        date: "",
        time: "",
    })
);

enum MODAL {
    NONE = 0,
    CALENDAR = 1,
    CLOCK = 2,
    EDIT = 3,
}

export function Settings() {
    const [compartments, setCompartments] = useState(initialCompartments);
    const [selectedCompartment, setSelectedCompartment] =
        useState<Compartment | null>(null);
    const [showModal, setShowModal] = useState(MODAL.NONE);
    const [selectedDate, setSelectedDate] = useState<DatesSelected>(
        {} as DatesSelected
    );
    const [time, setTime] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setDataFromDatabase();
    }, []);

    async function setDataFromDatabase() {
        try {
            const compartmentPromises = Array.from({ length: 14 }, (_, i) => {
                const compartmentId = i + 1;
                return firestore()
                    .collection("TabelaRemedios")
                    .where("compartimento", "==", `${compartmentId}`)
                    .get()
                    .then((snapshot) => {
                        if (!snapshot.empty) {
                            const data = snapshot.docs[0].data();
                            return {
                                id: compartmentId,
                                medicineName: data.nome || "",
                                date: data.dia_previsto || "",
                                time: data.horario_previsto || "",
                            };
                        } else {
                            return {
                                id: compartmentId,
                                medicineName: "",
                                date: "",
                                time: "",
                            };
                        }
                    });
            });

            const compartmentsData = await Promise.all(compartmentPromises);

            setCompartments(compartmentsData);
            console.log("Data loaded from Database.");
            setIsLoading(false);
        } catch (error) {
            console.error("Error when loading compartment data:", error);
        }
    }

    function handleSelectDate(selectedDay: DateData) {
        const dates = calendarUtils.orderStartsAtAndEndsAt({
            startsAt: selectedDate.startsAt,
            endsAt: selectedDate.startsAt,
            selectedDay,
        });

        setSelectedDate(dates);

        if (selectedCompartment) {
            setSelectedCompartment({
                ...selectedCompartment,
                date: dayjs(selectedDay.dateString).format("DD/MM/YYYY"),
            });
        }
    }

    function handleEditCompartment(id: number) {
        const compartment = compartments.find((comp) => comp.id === id);
        if (compartment) {
            setSelectedCompartment(compartment);
            setTime(compartment.time);
            setShowModal(MODAL.EDIT);
        }
    }

    function handleDeleteCompartment(id: number) {
        Alert.alert(
            "Confirmar Exclusão",
            "Tem certeza que deseja apagar as informações deste compartimento?",
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Confirmar",
                    onPress: async () => {
                        const updatedCompartments = compartments.map((comp) =>
                            comp.id === id
                                ? { ...comp, medicineName: "", date: "", time: "" }
                                : comp
                        );

                        setCompartments(updatedCompartments);
                        await deleteCompartmentFromFirebase(id);
                    },
                },
            ]
        );
    }

    async function deleteCompartmentFromFirebase(id: number) {
        try {
            const snapshot = await firestore()
                .collection("TabelaRemedios")
                .where("compartimento", "==", `${id}`)
                .get();

            if (!snapshot.empty) {
                await snapshot.docs[0].ref.update({
                    nome: "",
                    horario_previsto: "",
                    dia_previsto: "",
                });
                console.log(`Compartment number ${id} deleted successfully!`);
            }
        } catch (error) {
            console.error(`Error deleting compartment number ${id}:`, error);
        }
    }

    function handleSaveCompartment() {
        if (selectedCompartment) {
            const previousCompartment =
                compartments[selectedCompartment.id - 2];

            if (
                previousCompartment &&
                dayjs(
                    selectedCompartment.date.replaceAll("/", "-") + " " + selectedCompartment.time
                ).isBefore(
                    dayjs(
                        previousCompartment.date.replaceAll("/", "-") +
                            " " +
                            previousCompartment.time
                    )
                )
            ) {
                Alert.alert(
                    "Erro ao cadastrar", 
                    `O horário do ${selectedCompartment.id}º repartimento deve ser após o horário do ${previousCompartment.id}º repartimento.`
                );
                return;
            }

            const updatedCompartments = compartments.map((comp) =>
                comp.id === selectedCompartment.id ? selectedCompartment : comp
            );
            saveCompartmentChangesOnFirebase(selectedCompartment);
            setCompartments(updatedCompartments);
            setShowModal(MODAL.NONE);
        }
    }

    async function saveCompartmentChangesOnFirebase(data: any) {
        const { date, id, medicineName, time } = data;
        console.log(`Trying to edit compartment number ${id}...`);
        const snapshot = await firestore()
            .collection("TabelaRemedios")
            .where("compartimento", "==", `${id}`)
            .get();
        snapshot.docs[0].ref.update({
            nome: medicineName,
            horario_previsto: time,
            dia_previsto: date,
        });
        console.log(`Compartment number ${id} edited successfully!`);
    }

    const onChangeTime = (formattedTime: string) => {
        setTime(formattedTime);

        if (selectedCompartment) {
            setSelectedCompartment({
                ...selectedCompartment,
                time: formattedTime,
            });
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Loading />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                style={styles.list}
                data={compartments}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.compartmentCard}>
                        <View style={styles.compartmentHeader}>
                            <Text style={styles.compartmentTitle}>
                                {`${item.id}º repartimento`}
                            </Text>
                            <Button
                                onPress={() => handleDeleteCompartment(item.id)}
                                variant="secondary"
                                style={styles.deleteButton}
                            >
                                <Trash size={20} color={colors.neutral[600]} />
                            </Button>
                        </View>
                        <Text style={styles.compartmentText}>
                            {`Nome do Remédio: ${item.medicineName}`}
                        </Text>
                        <Text style={styles.compartmentText}>
                            {`Data: ${item.date}`}
                        </Text>
                        <Text
                            style={[
                                styles.compartmentText,
                                styles.compartmentTextMargin,
                            ]}
                        >
                            {`Horário: ${item.time}`}
                        </Text>
                        <View style={styles.buttonContainer}>
                            <Button
                                onPress={() => handleEditCompartment(item.id)}
                                variant="secondary"
                            >
                                <Pencil size={24} color={colors.neutral[700]} />
                                <Button.Title>Editar</Button.Title>
                            </Button>
                        </View>
                    </View>
                )}
            />
            {selectedCompartment && (
                <Modal
                    title={`Editar Repartimento ${selectedCompartment.id}`}
                    visible={showModal === MODAL.EDIT}
                    onClose={() => setShowModal(MODAL.NONE)}
                >
                    <View style={styles.modalContent}>
                        <TextInput
                            placeholder="Nome do Remédio"
                            value={selectedCompartment.medicineName}
                            onChangeText={(text) =>
                                setSelectedCompartment({
                                    ...selectedCompartment,
                                    medicineName: text,
                                })
                            }
                            style={styles.textInput}
                        />

                        <View style={styles.dateTimeContainer}>
                            <Button
                                onPress={() => setShowModal(MODAL.CALENDAR)}
                                variant="secondary"
                            >
                                <Button.Title>Selecionar Data</Button.Title>
                            </Button>
                            <Text style={styles.dateTimeText}>
                                {selectedCompartment.date}
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.dateTimeContainer,
                                styles.dateTimeMargin,
                            ]}
                        >
                            <Button
                                onPress={() => setShowModal(MODAL.CLOCK)}
                                variant="secondary"
                            >
                                <Button.Title>Selecionar Horário</Button.Title>
                            </Button>
                            <Text style={styles.dateTimeText}>
                                {selectedCompartment.time}
                            </Text>
                        </View>

                        <Button onPress={handleSaveCompartment}>
                            <Button.Title>Salvar</Button.Title>
                        </Button>
                    </View>
                </Modal>
            )}

            <Modal
                title="Qual dia?"
                subtitle="Selecione a data para o remédio do repartimento especificado"
                visible={showModal === MODAL.CALENDAR}
                onClose={() => setShowModal(MODAL.EDIT)}
            >
                <View style={styles.modalContent}>
                    <Calendar
                        minDate={dayjs().toISOString()}
                        onDayPress={handleSelectDate}
                        markedDates={selectedDate.dates}
                    />

                    <Button onPress={() => setShowModal(MODAL.EDIT)}>
                        <Button.Title>Confirmar</Button.Title>
                    </Button>
                </View>
            </Modal>

            <Modal
                title="Que horas?"
                subtitle="Selecione o horário para o remédio do repartimento especificado"
                visible={showModal === MODAL.CLOCK}
                onClose={() => setShowModal(MODAL.EDIT)}
            >
                <View style={styles.modalContent}>
                    <Clock
                        onTimeChange={onChangeTime}
                        containerStyle="bg-transparent"
                    />

                    <Button
                        onPress={() => {
                            setShowModal(MODAL.EDIT);
                        }}
                    >
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
        marginBottom: 128,
        marginHorizontal: 20,
    },
    list: {
        width: "100%",
        marginTop: 8,
    },
    compartmentCard: {
        backgroundColor: "#E5E7EB", // equivalente a bg-neutral-200
        padding: 16,
        marginBottom: 16,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        width: "100%",
    },
    compartmentTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        flexGrow: 1
    },
    compartmentText: {
        fontSize: 18,
    },
    compartmentTextMargin: {
        marginBottom: 16,
    },
    buttonContainer: {
        alignSelf: "center",
        width: 112,
    },
    modalContent: {
        gap: 16,
        marginTop: 16,
    },
    textInput: {
        backgroundColor: "#E5E7EB", // equivalente a bg-gray-200
        padding: 8,
        borderRadius: 8,
    },
    dateTimeContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    dateTimeText: {
        fontSize: 24,
        textAlign: "center",
        color: "#FFFFFF",
        fontWeight: "600",
        flex: 1,
        paddingVertical: 8,
    },
    dateTimeMargin: {
        marginBottom: 16,
    },
    loadingContainer: {
        backgroundColor: "#fff",
        display: "flex",
        alignContent: "center",
        justifyContent: "center",
        margin: "auto",
    },
    deleteButton: {
        backgroundColor: "#F87171",
        height: 36,
        width: 36,
    },
    compartmentHeader: {
        display: "flex",
        flexDirection: "row"
    }
});
