import { View, Text, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "../../constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Number = ({ number, label }) => (
  <View style={{ alignItems: "center", margin: 10 }}>
    <Text style={{ color: colors.lightgrey, fontSize: 30, fontWeight: "bold" }}>
      {number}
    </Text>
    <Text style={{ color: colors.lightgrey, fontSize: 16 }}>{label}</Text>
  </View>
);

const EndScreen = ({ won = false }) => {
  const [played, setPlayed] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [curStreak, setCurStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  useEffect(() => {
    readState();
  }, []);

  const readState = async () => {
    const dataString = await AsyncStorage.getItem("@game");
    let data;
    try {
      data = JSON.parse(dataString);
      console.log(data);
    } catch (e) {
      console.log("Failed reading the state", e);
    }

    const keys = Object.keys(data);
    const values = Object.values(data);

    setPlayed(keys.length);

    const numberOfWins = values.filter(
      (game) => game.gameState === "won"
    ).length;
    setWinRate(Math.floor((100 * numberOfWins) / keys.length));

    let curStreak = 0;
    let maxStreak = 0;
    keys.forEach((key) => {
      if (data[key].gameState === "won") {
        curStreak += 1;
      } else {
        curStreak = 0;
      }
    });
    if (curStreak > maxStreak) {
      maxStreak = curStreak;
    }
    setCurStreak(curStreak);
    setMaxStreak(maxStreak);
  };

  return (
    <View>
      <Text style={styles.title}>{won ? "Congrats!" : "Try again"}</Text>
      <Text style={styles.subtitle}>Statistics</Text>
      <View style={{ flexDirection: "row" }}>
        <Number number={played} label={"Played"} />
        <Number number={winRate} label={"Win %"} />
        <Number number={curStreak} label={"Cur streak"} />
        <Number number={maxStreak} label={"Max streak"} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    color: "white",
    textAlign: "center",
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 20,
    color: colors.lightgrey,
    textAlign: "center",
    marginVertical: 15,
    fontWeight: "bold",
  },
});

export default EndScreen;
