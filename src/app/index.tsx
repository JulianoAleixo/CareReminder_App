import { useState, useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";
import {
    House,
    Settings as SettingsIcon,
    BriefcaseMedical,
} from "lucide-react-native";
import { Button } from "@/components/button";
import { colors } from "@/styles/colors";
import { Home } from "./home";
import { History } from "./history";
import { Settings } from "./settings";

import firestore from "@react-native-firebase/firestore";
import { Loading } from "@/components/loading";
import dayjs from "dayjs";
import * as ExpoNotifications from "expo-notifications";

export default function Index() {
    const [option, setOption] = useState<"home" | "history" | "settings">(
        "home"
    );
    const [isLoading, setIsLoading] = useState(true);
    const [nextMedicine, setNextMedicine] = useState<string>("N/A");
    const [nextHour, setNextHour] = useState<string>("N/A");
    const [nextDay, setNextDay] = useState<string>("N/A");

    useEffect(() => {
        createTables();
        establishConnectionWithFirebase();
        setIsLoading(false);
    }, []);

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

    function establishConnectionWithFirebase() {
        firestore()
            .collection("TabelaRemedios")
            .onSnapshot((snapshot) => {
                const sortedDocs = snapshot.docs.sort((a, b) => {
                    return (
                        parseInt(a.data().compartimento) -
                        parseInt(b.data().compartimento)
                    );
                });
                let foundNextMedicine = false;
                sortedDocs.forEach((doc) => {
                    const medicine = doc.data();
                    if (
                        !foundNextMedicine &&
                        !medicine["horario_tomado"] &&
                        medicine["horario_previsto"]
                    ) {
                        setNextMedicine(medicine["nome"]);
                        setNextDay(medicine["dia_previsto"]);
                        setNextHour(medicine["horario_previsto"]);
                        foundNextMedicine = true;
                    }
                });

                if (foundNextMedicine) {
                    const [day, month, year] = nextDay.split("/").map(Number);
                    const [hours, minutes] = nextHour.split(":").map(Number);

                    const triggerDate = new Date(
                        year,
                        month - 1,
                        day,
                        hours,
                        minutes
                    );
    
                    const adjustedTriggerDate = new Date(triggerDate.getTime() - 3 * 60 * 60 * 1000);
    
                    const now = new Date();
                    const currentTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    
                    console.log(adjustedTriggerDate >= currentTime);
                    if (adjustedTriggerDate >= currentTime) {
                        console.log("Scheduling notification for ", triggerDate)
                        ExpoNotifications.scheduleNotificationAsync({
                            content: {
                                title: "Hora de tomar remédio!",
                                body: `Está na hora de tomar ${nextMedicine}.`,
                            },
                            trigger: {
                                date: triggerDate,
                            },
                        });
                    }
                }
            });
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
                <BriefcaseMedical color={colors.neutral[200]} size={36} />
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
                                    : colors.blue[100]
                            }
                            size={30}
                        />
                        <Button.Title>Home</Button.Title>
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
                                    : colors.blue[100]
                            }
                            size={30}
                        />
                        <Button.Title>Configuração</Button.Title>
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
        width: "25%",
    },
});
