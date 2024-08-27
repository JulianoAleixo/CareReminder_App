import { useState, useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";
import {
    Bell,
    House,
    CalendarRange,
    Settings as SettingsIcon,
} from "lucide-react-native";
import { Button } from "@/components/button";
import { colors } from "@/styles/colors";
import { Home } from "./home";
import { History } from "./history";
import { Settings } from "./settings";

import firestore from "@react-native-firebase/firestore";
import { Loading } from "@/components/loading";
import dayjs from "dayjs";

export default function Index() {
    const [option, setOption] = useState<"home" | "history" | "settings">(
        "home"
    );
    const [isLoading, setIsLoading] = useState(true);
    const [nextMedicine, setNextMedicine] = useState<string>("N/A");
    const [nextHour, setNextHour] = useState<string>("N/A");
    const [nextDay, setNextDay] = useState<string>("N/A");

    useEffect(() => {
        const interval = setInterval(() => {
        }, 30000);
        
        if (option === "home") {
            createTables();
            getDataFromDatabase();
        } 
        
    }, [option]);

    async function createTables() {
        try {
            const snapshot = await firestore()
                .collection("TabelaRemedios")
                .get();

            if (snapshot.empty) {
                console.log("Creating Tables on Firestore");
                for (let i = 1; i <= 14; i++) {
                    await firestore()
                        .collection("TabelaRemedios")
                        .add({
                            compartimento: `${i}`,
                            nome: "",
                            horario_previsto: "",
                            dia_previsto: "",
                            horario_retirado: "",
                            dia_retirado: "",
                            horario_tomado: "",
                            dia_tomado: "",
                        });
                }
                console.log("Tables Created");
            }
        } catch (e) {
            console.log("Error creating tables:", e);
        }
    }

    async function getDataFromDatabase() {
        try {
            const snapshot = await firestore()
                .collection("TabelaRemedios")
                .get();

            let compartmentsData = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: Number(data.compartimento),
                    medicineName: data.nome || "",
                    date_expected: data.dia_previsto || "",
                    time_expected: data.horario_previsto || "",
                    date_taken: data.dia_tomado || "",
                    time_taken: data.horario_tomado || "",
                };
            });

            compartmentsData = compartmentsData.sort((a, b) => a.id - b.id);

            const now = dayjs();

            let found = false;
            for (let i = 1; i <= 14; i++) {
                if (found) {
                    break;
                }
                compartmentsData.forEach((compartmentData) => {
                    if (found) {
                        return;
                    }

                    if (compartmentData.id === i) {
                        if (
                            !compartmentData.date_taken &&
                            !compartmentData.time_taken &&
                            compartmentData.date_expected &&
                            compartmentData.time_expected
                        ) {
                            if (!found) {
                                setNextMedicine(compartmentData.medicineName);
                                setNextHour(compartmentData.time_expected);
                                setNextDay(compartmentData.date_expected);
                                found = true;
                            }
                        }
                    }
                });
            }

            setIsLoading(false);
        } catch (e) {
            console.log("Error fetching data:", e);
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Loading />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>CareReminder</Text>
                <Bell color={colors.neutral[200]} size={24} />
            </View>

            {/* Content */}
            {option === "home" ? (
                <Home
                    nomeRemedio={nextMedicine}
                    horario={nextHour}
                    data={nextDay}
                />
            ) : option === "history" ? (
                <History />
            ) : (
                <Settings />
            )}

            {/* Bottom Menu */}
            <View style={styles.bottomMenuContainer}>
                <View style={styles.bottomMenu}>
                    <Button
                        onPress={() => {
                            setOption("home");
                        }}
                        variant={option === "home" ? "secondary" : "primary"}
                        style={styles.navButtons}
                    >
                        <House
                            color={
                                option === "home"
                                    ? colors.neutral[700]
                                    : colors.sky[100]
                            }
                            size={30}
                        />
                        {/* <Button.Title>Home</Button.Title> */}
                    </Button>

                    <Button
                        onPress={() => setOption("history")}
                        variant={option === "history" ? "secondary" : "primary"}
                        style={styles.navButtons}
                    >
                        <CalendarRange
                            color={
                                option === "history"
                                    ? colors.neutral[700]
                                    : colors.sky[100]
                            }
                            size={30}
                        />
                        {/* <Button.Title>Histórico</Button.Title> */}
                    </Button>

                    <Button
                        onPress={() => setOption("settings")}
                        variant={
                            option === "settings" ? "secondary" : "primary"
                        }
                        style={styles.navButtons}
                    >
                        <SettingsIcon
                            color={
                                option === "settings"
                                    ? colors.neutral[700]
                                    : colors.sky[100]
                            }
                            size={30}
                        />
                        {/* <Button.Title>Configuração</Button.Title> */}
                    </Button>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 64,
    },
    header: {
        marginHorizontal: 20,
        backgroundColor: "#1D4ED8", // blue-700
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#1E3A8A", // blue-800
    },
    headerText: {
        color: "#E5E7EB", // neutral-200
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
    },
    bottomMenuContainer: {
        width: "100%",
        position: "absolute",
        bottom: 0,
        justifyContent: "flex-end",
        padding: 20,
        zIndex: 10,
        backgroundColor: "#F5F5F5", // neutral-100
    },
    bottomMenu: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        backgroundColor: "#1D4ED8", // blue-700
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#1E3A8A", // blue-800
        gap: 8,
        justifyContent: "space-evenly",
    },
    loadingContainer: {
        backgroundColor: "#fff",
        display: "flex",
        alignContent: "center",
        justifyContent: "center",
        margin: "auto",
    },
    navButtons: {
        width: "25%"
    }
});
